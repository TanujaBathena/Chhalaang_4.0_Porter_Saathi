import React, { useState, useEffect } from 'react';
import { validateMobile, validateOTP } from '../utils/validationUtils';
import { useVoiceInstructions } from '../hooks/useVoiceInstructions';
import apiService from '../utils/apiService';

const LoginPage = ({ language, onLogin, onGoToSignup, t, speak, stopVoice }) => {
    const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [voiceGuidanceActive, setVoiceGuidanceActive] = useState(false);

    // Use voice instruction management hook
    const { speakOnce, speakStepInstruction } = useVoiceInstructions(speak);

    // Speak instructions when component mounts - only once
    useEffect(() => {
        const welcomeMsg = `${t('loginTitle')}. ${t('enterMobile')}`;
        speakOnce(welcomeMsg);
    }, [t, speakOnce]);

    // Voice guidance for each step - only when voice guidance is manually activated and step changes
    useEffect(() => {
        if (voiceGuidanceActive && step) {
            let guidance = '';
            switch (step) {
                case 'mobile':
                    // Use different message for manual voice guidance to avoid duplication
                    guidance = `${t('enterMobile')}`;
                    break;
                case 'otp':
                    guidance = `${t('otpSent')}. ${t('enterOTP')}`;
                    break;
                default:
                    guidance = '';
            }
            if (guidance) {
                setTimeout(() => speakStepInstruction(guidance, step), 500);
            }
        }
    }, [step, voiceGuidanceActive, t, speakStepInstruction]);

    const handleSendOTP = async () => {
        setError('');
        console.log('🔵 Starting OTP request for mobile:', mobileNumber);
        console.log('🔵 Mobile number type:', typeof mobileNumber);
        console.log('🔵 Mobile number length:', mobileNumber?.length);
        console.log('🔵 Mobile number raw:', JSON.stringify(mobileNumber));
        
        if (!validateMobile(mobileNumber)) {
            const errorMsg = t('invalidMobile');
            console.log('❌ Mobile validation failed:', mobileNumber);
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        try {
            console.log('📞 Calling apiService.sendOTP...');
            const response = await apiService.sendOTP(mobileNumber);
            console.log('✅ OTP Response:', response);
            setStep('otp');
            const otpMsg = t('otpSent');
            speak(otpMsg);
            console.log('OTP sent:', response.otp); // For development - remove in production
        } catch (error) {
            console.error('❌ OTP Error:', error);
            const errorMsg = error.message || t('networkError');
            setError(errorMsg);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        console.log('🔵 Starting login with mobile:', mobileNumber, 'OTP:', otp);
        
        if (!validateOTP(otp)) {
            const errorMsg = t('invalidOTP');
            console.log('❌ OTP validation failed:', otp);
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        try {
            console.log('🔐 Calling apiService.login...');
            const response = await apiService.login(mobileNumber, otp);
            console.log('✅ Login Response:', response);
            console.log('👤 User data:', response.user);
            onLogin(true, response.user);
        } catch (error) {
            console.error('❌ Login Error:', error);
            const errorMsg = error.message || t('networkError');
            setError(errorMsg);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.sendOTP(mobileNumber);
            setError('');
            const resendMsg = t('otpSent');
            speak(resendMsg);
            console.log('OTP resent:', response.otp); // For development - remove in production
        } catch (error) {
            const errorMsg = error.message || t('networkError');
            setError(errorMsg);
            speak(errorMsg);
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">Porter Saathi</h1>
                    <h2 className="text-xl font-semibold text-gray-700">{t('loginTitle')}</h2>
                </div>

                {renderVoiceControls()}

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">
                        {t('dontHaveAccount')}{' '}
                        <button
                            onClick={onGoToSignup}
                            className="text-blue-600 font-semibold hover:text-blue-800"
                        >
                            {t('signupHere')}
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
                                onChange={(e) => {
                                    console.log('📱 Mobile input changed:', e.target.value);
                                    setMobileNumber(e.target.value);
                                    console.log('📱 Mobile state will be:', e.target.value);
                                }}
                                placeholder={t('enterMobile')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                maxLength="10"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
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
                                t('verifyLogin')
                            )}
                        </button>
                        
                        <div className="text-center">
                            <button
                                onClick={handleResendOTP}
                                disabled={isLoading}
                                className="text-blue-600 font-semibold hover:text-blue-800 disabled:text-blue-300"
                            >
                                {t('resendOTP')}
                            </button>
                        </div>
                        
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
            </div>
        </div>
    );
};

export default LoginPage;