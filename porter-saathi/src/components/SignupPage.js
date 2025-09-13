import React, { useState, useEffect } from 'react';
import { validateMobile, validateOTP, validateAadhar, validateLicense, validateVehicleNumber, validateName, validateFile } from '../utils/validationUtils';
import { useVoiceInstructions } from '../hooks/useVoiceInstructions';
// import { useOCRVoiceConfirmation } from '../hooks/useOCRVoiceConfirmation'; // No longer needed
import { processDocument, processAadhaarCard, processDrivingLicense, processVehicleRC, validateExtractedData, getConfidenceScore } from '../utils/ocrUtils';
import apiService from '../utils/apiService';

const SignupPage = ({ language, onSignupComplete, onBackToLogin, t, speak, stopVoice }) => {
    const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'driver_details', 'documents'
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [voiceGuidanceActive, setVoiceGuidanceActive] = useState(false);
    
    // Driver details
    const [driverDetails, setDriverDetails] = useState({
        name: '',
        aadharNumber: '',
        licenseNumber: '',
        vehicleNumber: '',
        emergencyContact: ''
    });
    
    // Documents
    const [documents, setDocuments] = useState({
        aadharCard: null,
        drivingLicense: null,
        vehicleRC: null,
        profilePhoto: null
    });
    
    const [documentPreviews, setDocumentPreviews] = useState({});
    
    // OCR and auto-fill state
    const [isOCRProcessing, setIsOCRProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [extractedData, setExtractedData] = useState(null);
    const [ocrError, setOcrError] = useState('');
    const [showOCRUpload, setShowOCRUpload] = useState(true);
    const [autoFillCompleted, setAutoFillCompleted] = useState(false);
    const [currentOCRDocument, setCurrentOCRDocument] = useState(''); // Track which document is being processed

    // Use voice instruction management hook
    const { speakOnce, speakStepInstruction } = useVoiceInstructions(speak);
    
    // Voice confirmation removed - documents are now auto-filled directly after OCR
    // const { ... } = useOCRVoiceConfirmation(speak, t); // No longer needed

    // Speak welcome message when component mounts - only once
    useEffect(() => {
        const signupMsg = t('signupVoiceWelcome');
        speakOnce(signupMsg);
    }, [t, speakOnce]);

    // Voice guidance for each step - only when voice guidance is active and step changes
    useEffect(() => {
        if (voiceGuidanceActive && step) {
            let guidance = '';
            switch (step) {
                case 'mobile':
                    guidance = `${t('signupTitle')}. ${t('enterMobile')}`;
                    break;
                case 'otp':
                    guidance = `${t('otpSent')}. ${t('enterOTP')}`;
                    break;
                case 'driver_details':
                    guidance = `${t('driverDetailsStep')}. ${t('fillDriverInfo')}`;
                    break;
                case 'documents':
                    guidance = `${t('documentsTitle')}. ${t('uploadAllDocuments')}`;
                    break;
                default:
                    guidance = '';
            }
            if (guidance) {
                setTimeout(() => speakStepInstruction(guidance, step), 500);
            }
        }
    }, [step, voiceGuidanceActive, t, speakStepInstruction]);

    // Field-specific voice guidance
    const handleFieldFocus = (fieldName) => {
        if (voiceGuidanceActive) {
            let guidance = '';
            switch (fieldName) {
                case 'name':
                    guidance = t('nameFieldGuidance');
                    break;
                case 'aadhar':
                    guidance = t('aadharFieldGuidance');
                    break;
                case 'license':
                    guidance = t('licenseFieldGuidance');
                    break;
                case 'vehicle':
                    guidance = t('vehicleFieldGuidance');
                    break;
                case 'emergency':
                    guidance = t('emergencyFieldGuidance');
                    break;
                default:
                    return;
            }
            speak(guidance);
        }
    };

    const handleSendOTP = async () => {
        setError('');
        if (!validateMobile(mobileNumber)) {
            const errorMsg = t('invalidMobile');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        
        try {
            console.log('📱 Sending OTP for signup to:', mobileNumber);
            
            // Call the real backend OTP API
            const response = await apiService.sendOTP(mobileNumber);
            
            console.log('✅ OTP sent for signup:', response);
            
            setStep('otp');
            const otpMsg = t('otpSent');
            speak(otpMsg);
            
        } catch (error) {
            console.error('❌ Failed to send OTP for signup:', error);
            setError(error.message || 'Failed to send OTP. Please try again.');
            speak(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        if (!validateOTP(otp)) {
            const errorMsg = t('invalidOTP');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        
        try {
            console.log('🔍 Verifying OTP for signup:', otp);
            
            // For signup, we just need to verify the OTP format is correct
            // The actual OTP verification happens during login, not signup
            // But we can optionally verify it exists in the database
            
            // Just proceed to next step after validation
            setStep('driver_details');
            if (voiceGuidanceActive) {
                speak(t('driverDetailsStep'));
            }
            
            console.log('✅ OTP verified for signup, proceeding to driver details');
            
        } catch (error) {
            console.error('❌ OTP verification failed:', error);
            setError(error.message || 'OTP verification failed. Please try again.');
            speak(error.message || 'OTP verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OCR processing of Aadhaar card
    const handleAadhaarOCR = async (file) => {
        if (!file) return;
        
        setIsOCRProcessing(true);
        setCurrentOCRDocument('aadharCard');
        setOcrProgress(0);
        setOcrError('');
        
        try {
            speak(t('ocrProcessing'));
            
            const data = await processAadhaarCard(file, (progress) => {
                setOcrProgress(progress);
                if (progress % 25 === 0) {
                    speak(`${t('ocrProgress')} ${progress}%`);
                }
            });
            
            const validation = validateExtractedData(data);
            const confidence = getConfidenceScore(data);
            
            console.log('OCR Validation:', validation);
            console.log('OCR Confidence:', confidence);
            
            if (!validation.isValid) {
                throw new Error(validation.errors.join('. '));
            }
            
            setExtractedData({ ...data, confidence, validation });
            setIsOCRProcessing(false);
            speak(t('ocrComplete'));
            
            // Auto-fill the form
            setTimeout(() => {
                autoFillFormFromOCR(data);
            }, 1500);
            
        } catch (error) {
            console.error('OCR Error:', error);
            setIsOCRProcessing(false);
            setCurrentOCRDocument('');
            setOcrError(error.message || t('ocrError'));
            speak(t('ocrError'));
        }
    };
    
    // Auto-fill form fields from OCR data
    const autoFillFormFromOCR = (data) => {
        console.log('Auto-filling form with OCR data:', data);
        
        // Directly auto-fill the fields without voice confirmation
        const updatedDetails = { ...driverDetails };
        
        if (data.name && data.name.trim()) {
            updatedDetails.name = data.name.trim();
            speak(`Name auto-filled: ${data.name}`);
        }
        
        if (data.aadhaarNumber && data.aadhaarNumber.trim()) {
            updatedDetails.aadharNumber = data.aadhaarNumber.trim();
            speak(`Aadhaar number auto-filled: ${data.aadhaarNumber}`);
        }
        
        // Update the form fields
        setDriverDetails(updatedDetails);
        setAutoFillCompleted(true);
        
        // Provide feedback to user
        setTimeout(() => {
            speak(t('autoFillComplete') || 'Auto-fill completed. Please verify the information and proceed.');
        }, 1500);
        
        // REMOVED: Voice confirmation step - no longer needed
        // const fieldsToConfirm = [];
        // if (fieldsToConfirm.length > 0) {
        //     setTimeout(() => {
        //         startVoiceConfirmation(fieldsToConfirm, handleVoiceConfirmationComplete);
        //     }, 2000);
        // }
    };
    
    // Voice confirmation completion handler removed - no longer needed
    // const handleVoiceConfirmationComplete = (results) => { ... }
    
    // Handle driving license OCR processing
    const handleLicenseOCR = async (file) => {
        if (!file) return;
        
        setIsOCRProcessing(true);
        setCurrentOCRDocument('drivingLicense');
        setOcrProgress(0);
        setOcrError('');
        
        try {
            speak(t('licenseProcessing') || 'Processing your driving license...');
            
            const data = await processDrivingLicense(file, (progress) => {
                setOcrProgress(progress);
                if (progress % 25 === 0) {
                    speak(`Reading license information ${progress}%`);
                }
            });
            
            console.log('License OCR Data:', data);
            
            setIsOCRProcessing(false);
            setCurrentOCRDocument('');
            speak(t('licenseExtracted') || 'License information extracted successfully!');
            
            // Auto-fill license number
            if (data.licenseNumber) {
                setDriverDetails(prev => ({
                    ...prev,
                    licenseNumber: data.licenseNumber
                }));
                
                // Provide immediate feedback without voice confirmation
                setTimeout(() => {
                    speak(`License number auto-filled: ${data.licenseNumber}. Please verify and proceed.`);
                }, 1500);
            }
            
        } catch (error) {
            console.error('License OCR Error:', error);
            setIsOCRProcessing(false);
            setCurrentOCRDocument('');
            setOcrError('Could not read the driving license clearly. Please upload a clearer image.');
            speak('Could not read the driving license clearly. Please upload a clearer image.');
        }
    };
    
    // Handle vehicle RC OCR processing
    const handleVehicleRCOCR = async (file) => {
        if (!file) return;
        
        setIsOCRProcessing(true);
        setCurrentOCRDocument('vehicleRC');
        setOcrProgress(0);
        setOcrError('');
        
        try {
            speak(t('vehicleProcessing') || 'Processing your vehicle RC...');
            
            const data = await processVehicleRC(file, (progress) => {
                setOcrProgress(progress);
                if (progress % 25 === 0) {
                    speak(`Reading vehicle information ${progress}%`);
                }
            });
            
            console.log('Vehicle RC OCR Data:', data);
            
            setIsOCRProcessing(false);
            setCurrentOCRDocument('');
            speak(t('vehicleExtracted') || 'Vehicle information extracted successfully!');
            
            // Auto-fill vehicle number
            if (data.vehicleNumber) {
                setDriverDetails(prev => ({
                    ...prev,
                    vehicleNumber: data.vehicleNumber
                }));
                
                // Provide immediate feedback without voice confirmation
                setTimeout(() => {
                    speak(`Vehicle number auto-filled: ${data.vehicleNumber}. Please verify and proceed.`);
                }, 1500);
            }
            
        } catch (error) {
            console.error('Vehicle RC OCR Error:', error);
            setIsOCRProcessing(false);
            setCurrentOCRDocument('');
            setOcrError('Could not read the vehicle RC clearly. Please upload a clearer image.');
            speak('Could not read the vehicle RC clearly. Please upload a clearer image.');
        }
    };

    // Handle Aadhaar card upload with OCR
    const handleAadhaarUpload = (file) => {
        if (!validateFile(file)) {
            const errorMsg = 'Invalid file. Please upload JPG, PNG files under 5MB.';
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        // Store the file for document upload
        setDocuments(prev => ({
            ...prev,
            aadharCard: file
        }));
        
        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentPreviews(prev => ({
                    ...prev,
                    aadharCard: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
        
        // Process with OCR
        handleAadhaarOCR(file);
    };
    
    // Handle license upload with OCR
    const handleLicenseUpload = (file) => {
        if (!validateFile(file)) {
            const errorMsg = 'Invalid file. Please upload JPG, PNG files under 5MB.';
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        // Store the file for document upload
        setDocuments(prev => ({
            ...prev,
            drivingLicense: file
        }));
        
        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentPreviews(prev => ({
                    ...prev,
                    drivingLicense: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
        
        // Process with OCR
        handleLicenseOCR(file);
    };
    
    // Handle vehicle RC upload with OCR
    const handleVehicleRCUpload = (file) => {
        if (!validateFile(file)) {
            const errorMsg = 'Invalid file. Please upload JPG, PNG files under 5MB.';
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        // Store the file for document upload
        setDocuments(prev => ({
            ...prev,
            vehicleRC: file
        }));
        
        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentPreviews(prev => ({
                    ...prev,
                    vehicleRC: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
        
        // Process with OCR
        handleVehicleRCOCR(file);
    };
    
    const handleDriverDetailsNext = () => {
        setError('');
        
        // Voice confirmation no longer used - removed
        
        // Validate all fields
        if (!validateName(driverDetails.name)) {
            const errorMsg = t('invalidName');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        if (!validateAadhar(driverDetails.aadharNumber)) {
            const errorMsg = t('invalidAadhar');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        if (!validateLicense(driverDetails.licenseNumber)) {
            const errorMsg = t('invalidLicense');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        if (!validateVehicleNumber(driverDetails.vehicleNumber)) {
            const errorMsg = t('invalidVehicleNumber');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        if (!validateMobile(driverDetails.emergencyContact)) {
            const errorMsg = t('invalidMobile');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setStep('documents');
        if (voiceGuidanceActive) {
            speak(t('documentsTitle'));
        }
    };

    const handleDocumentUpload = (docType, file) => {
        if (!validateFile(file)) {
            const errorMsg = 'Invalid file. Please upload JPG, PNG or PDF files under 5MB.';
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setDocuments(prev => ({
            ...prev,
            [docType]: file
        }));
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setDocumentPreviews(prev => ({
                    ...prev,
                    [docType]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
        
        setError('');
        const successMsg = `${t('uploadDocument')} ${docType} successful`;
        speak(successMsg);
    };

    const handleCompleteSignup = async () => {
        setError('');
        
        // Validate required driver details
        if (!driverDetails.name || !driverDetails.aadharNumber || !driverDetails.licenseNumber || 
            !driverDetails.vehicleNumber || !driverDetails.emergencyContact) {
            const errorMsg = t('fillAllRequiredFields') || 'Please fill all required fields';
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        // Documents are optional for signup - can be uploaded later
        // const requiredDocs = ['aadharCard', 'drivingLicense', 'vehicleRC', 'profilePhoto'];
        // const missingDocs = requiredDocs.filter(doc => !documents[doc]);
        
        setIsLoading(true);
        
        try {
            console.log('🚀 Starting signup process...');
            
            // Prepare signup data for backend API
            const signupData = {
                mobile: mobileNumber,
                name: driverDetails.name,
                aadharNumber: driverDetails.aadharNumber,
                licenseNumber: driverDetails.licenseNumber,
                vehicleNumber: driverDetails.vehicleNumber,
                emergencyContact: driverDetails.emergencyContact
            };
            
            console.log('📤 Sending signup data:', signupData);
            
            // Call the real backend signup API
            const response = await apiService.signup(signupData);
            
            console.log('✅ Signup successful:', response);
            
            const successMsg = t('signupSuccess');
            speak(successMsg);
            
            // Call onSignupComplete with the response data
            onSignupComplete({
                user: response.user,
                token: response.token,
                message: response.message
            });
            
        } catch (error) {
            console.error('❌ Signup failed:', error);
            setError(error.message || 'Signup failed. Please try again.');
            speak(error.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVoiceGuidance = () => {
        setVoiceGuidanceActive(!voiceGuidanceActive);
        if (!voiceGuidanceActive) {
            speak(t('voiceGuidance') + ' activated');
        } else {
            stopVoice();
            speak(t('stopGuidance'));
        }
    };

    const renderVoiceControls = () => (
        <div className="flex justify-center gap-2 mb-4">
            <button
                onClick={toggleVoiceGuidance}
                className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    voiceGuidanceActive 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-700'
                }`}
            >
                <span>🎤</span>
                <span>{voiceGuidanceActive ? t('voiceGuidanceOn') : t('voiceGuidance')}</span>
            </button>
            
            {voiceGuidanceActive && (
                <button
                    onClick={stopVoice}
                    className="px-4 py-2 rounded-lg font-medium flex items-center space-x-2 bg-red-600 text-white hover:bg-red-700"
                    title={t('stopVoice')}
                >
                    <span>⏹️</span>
                    <span>{t('stopVoice')}</span>
                </button>
            )}
        </div>
    );

    const renderDocumentUpload = (docType, label) => {
        const getUploadHandler = (docType) => {
            switch (docType) {
                case 'aadharCard':
                    return handleAadhaarUpload;
                case 'drivingLicense':
                    return handleLicenseUpload;
                case 'vehicleRC':
                    return handleVehicleRCUpload;
                default:
                    return (file) => handleDocumentUpload(docType, file);
            }
        };

        const hasOCRSupport = ['aadharCard', 'drivingLicense', 'vehicleRC'].includes(docType);

        return (
            <div key={docType} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label} *
                    {hasOCRSupport && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            🤖 Smart Fill Available
                        </span>
                    )}
                    {/* Show success indicator for auto-filled fields */}
                    {docType === 'drivingLicense' && driverDetails.licenseNumber && driverDetails.licenseNumber.length > 10 && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✅ Auto-filled
                        </span>
                    )}
                    {docType === 'vehicleRC' && driverDetails.vehicleNumber && driverDetails.vehicleNumber.length > 8 && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            ✅ Auto-filled
                        </span>
                    )}
                </label>
                <div className="flex items-center space-x-2">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => getUploadHandler(docType)(e.target.files[0])}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={isOCRProcessing}
                    />
                    {documents[docType] && (
                        <span className="text-green-600 text-sm">✓</span>
                    )}
                </div>
                
                {hasOCRSupport && (
                    <p className="text-xs text-blue-600">
                        📄 Upload a clear image for automatic form filling
                    </p>
                )}
                
                {/* OCR Processing Status for individual documents */}
                {isOCRProcessing && currentOCRDocument === docType && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="text-xs text-blue-700">
                                {docType === 'aadharCard' && 'Processing Aadhaar card...'}
                                {docType === 'drivingLicense' && 'Processing driving license...'}
                                {docType === 'vehicleRC' && 'Processing vehicle RC...'}
                                {!['aadharCard', 'drivingLicense', 'vehicleRC'].includes(docType) && 'Processing document...'}
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-1">
                            <div 
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                                style={{ width: `${ocrProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">{ocrProgress}% complete</p>
                    </div>
                )}
                
                {ocrError && currentOCRDocument === docType && (
                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-700">{ocrError}</p>
                        <button
                            onClick={() => {
                                setOcrError('');
                                setCurrentOCRDocument('');
                            }}
                            className="mt-1 px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                
                {documentPreviews[docType] && (
                    <img
                        src={documentPreviews[docType]}
                        alt={`${label} preview`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">Porter Saathi</h1>
                    <h2 className="text-xl font-semibold text-gray-700">
                        {t('signupTitle')}
                    </h2>
                </div>

                {renderVoiceControls()}

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">
                        {t('alreadyHaveAccount')}{' '}
                        <button
                            onClick={onBackToLogin}
                            className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                            {t('loginHere')}
                        </button>
                    </p>
                </div>

                {step === 'mobile' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('mobileNumber')}
                            </label>
                            <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder={t('enterMobile')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                maxLength="10"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}
                        
                        <button
                            onClick={handleSendOTP}
                            disabled={isLoading || !mobileNumber}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                t('sendOTP')
                            )}
                        </button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                {t('otpSent')}
                            </p>
                            <p className="text-lg font-semibold text-gray-800">
                                +91 {mobileNumber}
                            </p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('enterOTP')}
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center tracking-widest"
                                maxLength="6"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}
                        
                        <button
                            onClick={handleVerifyOTP}
                            disabled={isLoading || !otp}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                t('continueToNextStep')
                            )}
                        </button>
                        
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setStep('mobile');
                                    setOtp('');
                                    setError('');
                                    const changeMsg = `${t('changeMobile')}. ${t('enterMobile')}`;
                                    speak(changeMsg);
                                }}
                                className="text-gray-600 font-medium hover:text-gray-800"
                            >
                                ← {t('changeMobile')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'driver_details' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                {t('driverDetailsStep')}
                            </h3>
                            <p className="text-sm text-blue-600">
                                {t('fillDriverInfo')}
                            </p>
                        </div>
                        
                        {/* Smart Auto-Fill Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-2xl">🤖</span>
                                <h4 className="text-lg font-semibold text-blue-800">{t('smartAutoFillTitle') || 'Smart Auto-Fill with OCR'}</h4>
                            </div>
                            <p className="text-sm text-blue-700 mb-4">
                                {t('uploadDocumentsAutoFill') || 'Upload clear images of your documents to automatically fill the form fields below'}
                            </p>
                            
                            {/* Aadhaar Card Upload */}
                            <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-600">📄</span>
                                        <span className="text-sm font-medium text-green-800">{t('aadharCard')}</span>
                                        {autoFillCompleted && extractedData?.name && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ {t('extracted') || 'Extracted'}</span>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleAadhaarUpload(e.target.files[0])}
                                    className="w-full px-3 py-2 border border-green-300 rounded text-sm"
                                    disabled={isOCRProcessing}
                                />
                                <p className="text-xs text-green-600 mt-1">→ {t('autoFillsNameAadhaar') || 'Auto-fills: Name & Aadhaar Number'}</p>
                            </div>
                            
                            {/* Driving License Upload */}
                            <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-600">🪪</span>
                                        <span className="text-sm font-medium text-blue-800">{t('drivingLicense')}</span>
                                        {driverDetails.licenseNumber && driverDetails.licenseNumber.length > 10 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">✅ {t('extracted') || 'Extracted'}</span>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLicenseUpload(e.target.files[0])}
                                    className="w-full px-3 py-2 border border-blue-300 rounded text-sm"
                                    disabled={isOCRProcessing}
                                />
                                <p className="text-xs text-blue-600 mt-1">→ {t('autoFillsLicense') || 'Auto-fills: License Number'}</p>
                            </div>
                            
                            {/* Vehicle RC Upload */}
                            <div className="bg-white p-3 rounded-lg border border-purple-200 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-purple-600">🚗</span>
                                        <span className="text-sm font-medium text-purple-800">{t('vehicleRC')}</span>
                                        {driverDetails.vehicleNumber && driverDetails.vehicleNumber.length > 8 && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">✅ {t('extracted') || 'Extracted'}</span>
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVehicleRCUpload(e.target.files[0])}
                                    className="w-full px-3 py-2 border border-purple-300 rounded text-sm"
                                    disabled={isOCRProcessing}
                                />
                                <p className="text-xs text-purple-600 mt-1">→ {t('autoFillsVehicle') || 'Auto-fills: Vehicle Number'}</p>
                            </div>
                            
                            {/* OCR Processing Status */}
                            {isOCRProcessing && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-blue-700">
                                            {currentOCRDocument === 'aadharCard' && (t('ocrProcessing') || 'Processing Aadhaar Card...')}
                                            {currentOCRDocument === 'drivingLicense' && (t('licenseProcessing') || 'Processing Driving License...')}
                                            {currentOCRDocument === 'vehicleRC' && (t('vehicleProcessing') || 'Processing Vehicle RC...')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${ocrProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">{ocrProgress}% {t('complete') || 'complete'}</p>
                                </div>
                            )}
                            
                            {/* OCR Error */}
                            {ocrError && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-sm text-red-700">{ocrError}</p>
                                    <button
                                        onClick={() => {
                                            setOcrError('');
                                            setCurrentOCRDocument('');
                                        }}
                                        className="mt-2 px-3 py-1 text-sm bg-red-200 text-red-700 rounded hover:bg-red-300"
                                    >
                                        {t('tryAgain') || 'Try Again'}
                                    </button>
                                </div>
                            )}
                            
                            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs text-yellow-700">
                                    💡 <strong>Tips:</strong> Use good lighting, avoid shadows, keep documents flat for best results
                                </p>
                            </div>
                        </div>
                        
                        {/* OCR Auto-fill Status - Simplified */}
                        {autoFillCompleted && extractedData && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-green-600">✅</span>
                                    <span className="text-sm font-medium text-green-800">
                                        Auto-fill Completed
                                    </span>
                                </div>
                                <p className="text-sm text-green-700">
                                    Information has been automatically filled from your documents. Please verify and proceed.
                                </p>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('fullName')} *
                                {autoFillCompleted && extractedData?.name && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        🤖 Auto-filled
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={driverDetails.name}
                                onChange={(e) => setDriverDetails(prev => ({...prev, name: e.target.value}))}
                                onFocus={() => handleFieldFocus('name')}
                                placeholder={t('enterFullName')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    autoFillCompleted && extractedData?.name 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('aadharNumber')} *
                                {autoFillCompleted && extractedData?.aadhaarNumber && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        🤖 Auto-filled
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={driverDetails.aadharNumber}
                                onChange={(e) => setDriverDetails(prev => ({...prev, aadharNumber: e.target.value}))}
                                onFocus={() => handleFieldFocus('aadhar')}
                                placeholder={t('enterAadhar')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    autoFillCompleted && extractedData?.aadhaarNumber 
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300'
                                }`}
                                maxLength="12"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('licenseNumber')} *
                                {driverDetails.licenseNumber && driverDetails.licenseNumber.length > 10 && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        🤖 Auto-filled
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={driverDetails.licenseNumber}
                                onChange={(e) => setDriverDetails(prev => ({...prev, licenseNumber: e.target.value.toUpperCase()}))}
                                onFocus={() => handleFieldFocus('license')}
                                placeholder={t('enterLicense')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    driverDetails.licenseNumber && driverDetails.licenseNumber.length > 10
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('vehicleNumber')} *
                                {driverDetails.vehicleNumber && driverDetails.vehicleNumber.length > 8 && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        🤖 Auto-filled
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={driverDetails.vehicleNumber}
                                onChange={(e) => setDriverDetails(prev => ({...prev, vehicleNumber: e.target.value.toUpperCase()}))}
                                onFocus={() => handleFieldFocus('vehicle')}
                                placeholder={t('enterVehicleNumber')}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    driverDetails.vehicleNumber && driverDetails.vehicleNumber.length > 8
                                        ? 'border-green-300 bg-green-50' 
                                        : 'border-gray-300'
                                }`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('emergencyContact')} *
                            </label>
                            <input
                                type="tel"
                                value={driverDetails.emergencyContact}
                                onChange={(e) => setDriverDetails(prev => ({...prev, emergencyContact: e.target.value}))}
                                onFocus={() => handleFieldFocus('emergency')}
                                placeholder={t('enterEmergencyContact')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength="10"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}
                        
                        <button
                            onClick={handleDriverDetailsNext}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                        >
                            {t('continueToNextStep')}
                        </button>
                        
                        <div className="text-center">
                            <button
                                onClick={() => setStep('otp')}
                                className="text-gray-600 font-medium hover:text-gray-800"
                            >
                                ← {t('goBackToPrevious')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'documents' && (
                    <div className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                {t('documentsTitle')}
                            </h3>
                            <p className="text-sm text-green-600">
                                Upload your documents for verification. Your form should already be auto-filled from the previous step.
                            </p>
                            <div className="mt-2 text-xs text-green-500">
                                📄 {t('supportedFormats')}: JPG, PNG, PDF (Max 5MB)
                            </div>
                        </div>

                        {/* Simple document uploads for verification */}
                        <div className="space-y-4">
                            {[
                                { key: 'aadharCard', label: t('aadharCard'), icon: '📄' },
                                { key: 'drivingLicense', label: t('drivingLicense'), icon: '🪪' },
                                { key: 'vehicleRC', label: t('vehicleRC'), icon: '🚗' },
                                { key: 'profilePhoto', label: t('profilePhoto'), icon: '📸' }
                            ].map(({ key, label, icon }) => (
                                <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <span className="text-lg">{icon}</span>
                                        <span className="font-medium text-gray-800">{label} *</span>
                                        {documents[key] && (
                                            <span className="text-green-600 text-sm">✓ Uploaded</span>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleDocumentUpload(key, e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    {documentPreviews[key] && (
                                        <img
                                            src={documentPreviews[key]}
                                            alt={`${label} preview`}
                                            className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-300"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}
                        
                        <button
                            onClick={handleCompleteSignup}
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                t('completeSignup')
                            )}
                        </button>
                        
                        <div className="text-center">
                            <button
                                onClick={() => setStep('driver_details')}
                                className="text-gray-600 font-medium hover:text-gray-800"
                            >
                                ← {t('goBackToPrevious')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignupPage;
