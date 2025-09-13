import React, { useState, useEffect } from 'react';
import apiService from '../../utils/apiService';
import { useEarnings } from '../../hooks/useEarnings';
import { validateFile } from '../../utils/validationUtils';

const ProfilePage = ({ t, language, onBack }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { earnings, loading: earningsLoading } = useEarnings();
    const [activeTab, setActiveTab] = useState('profile');
    
    // Debug function - can be called from browser console
    window.debugProfilePage = {
        testAPI: async () => {
            console.log('🧪 Testing API connectivity...');
            try {
                const health = await fetch('http://localhost:8080/health');
                console.log('✅ Health check:', await health.json());
                
                const profile = await apiService.getUserProfile();
                console.log('✅ Profile API:', profile);
                
                const earnings = await apiService.getEarnings();
                console.log('✅ Earnings API:', earnings);
                
                return { success: true, message: 'All APIs working' };
            } catch (err) {
                console.error('❌ API test failed:', err);
                return { success: false, error: err.message };
            }
        },
        getState: () => ({
            user,
            loading,
            error,
            earnings,
            earningsLoading,
            isAuthenticated: apiService.isAuthenticated(),
            hasToken: !!apiService.getToken()
        }),
        retryFetch: () => fetchUserProfile()
    };
    
    // Document upload states
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});

    useEffect(() => {
        // Check authentication first
        if (!apiService.isAuthenticated()) {
            setError('Please login to view your profile');
            setLoading(false);
            return;
        }
        
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Starting profile fetch...');
            console.log('🔍 API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1');
            console.log('🔍 Is authenticated:', apiService.isAuthenticated());
            console.log('🔍 Token:', apiService.getToken() ? 'Present' : 'Missing');
            
            // Double-check authentication before making API call
            if (!apiService.isAuthenticated()) {
                throw new Error('Authentication required. Please login again.');
            }
            
            console.log('🌐 Making API call to getUserProfile...');
            const userData = await apiService.getUserProfile();
            console.log('✅ Profile data loaded:', userData);
            
            // Validate the response structure
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid profile data received from server');
            }
            
            setUser(userData);
            console.log('✅ User state updated successfully');
            
        } catch (err) {
            console.error('❌ Failed to fetch user profile:', err);
            console.error('❌ Error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            
            setError(err.message);
            
            // If it's an auth error, try fallback to stored data
            if (err.message.includes('Authentication') || err.message.includes('login')) {
                console.log('🔍 Trying fallback to stored user data...');
                const storedUser = apiService.getUserData();
                console.log('📦 Stored user data:', storedUser);
                
                if (storedUser) {
                    console.log('📦 Using stored user data as fallback');
                    setUser(storedUser);
                    setError(null); // Clear error if we have fallback data
                } else {
                    console.log('❌ No stored user data available');
                }
            }
        } finally {
            setLoading(false);
            console.log('🏁 Profile fetch completed');
        }
    };

    // Handle document upload
    const handleDocumentUpload = async (docType, file) => {
        if (!validateFile(file)) {
            setError('Invalid file. Please upload JPG, PNG, or PDF files under 5MB.');
            return;
        }

        setUploadingDoc(docType);
        setUploadProgress({ ...uploadProgress, [docType]: 0 });
        setError(null);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', docType);

            console.log(`📤 Uploading ${docType}:`, file.name);

            // Upload document
            const response = await apiService.uploadDocument(formData);
            console.log('✅ Document uploaded successfully:', response);

            // Update user data with new document
            setUser(prevUser => ({
                ...prevUser,
                documents: {
                    ...prevUser.documents,
                    [docType]: response.document
                }
            }));

            setUploadProgress({ ...uploadProgress, [docType]: 100 });
            
            // Clear upload state after a short delay
            setTimeout(() => {
                setUploadingDoc(null);
                setUploadProgress({ ...uploadProgress, [docType]: 0 });
            }, 2000);

        } catch (err) {
            console.error(`❌ Failed to upload ${docType}:`, err);
            setError(`Failed to upload ${docType}: ${err.message}`);
            setUploadingDoc(null);
            setUploadProgress({ ...uploadProgress, [docType]: 0 });
        }
    };

    // Handle file input change
    const handleFileChange = (docType, event) => {
        const file = event.target.files[0];
        if (file) {
            handleDocumentUpload(docType, file);
        }
    };

    const handleLoginRedirect = () => {
        // Redirect to login or show login modal
        onBack();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
                    <div className="mt-2 text-xs text-gray-500">
                        <p>Auth: {apiService.isAuthenticated() ? '✅' : '❌'}</p>
                        <p>Token: {apiService.getToken() ? '✅' : '❌'}</p>
                        <p>Earnings Loading: {earningsLoading ? '⏳' : '✅'}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {error.includes('login') ? 'Authentication Required' : 'Error Loading Profile'}
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        <p><strong>Debug Info:</strong></p>
                        <p>Auth: {apiService.isAuthenticated() ? '✅ Yes' : '❌ No'}</p>
                        <p>Token: {apiService.getToken() ? '✅ Present' : '❌ Missing'}</p>
                        <p>API URL: {process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'}</p>
                        <p>Earnings: {earnings ? '✅ Loaded' : '❌ Not loaded'}</p>
                        <p>Earnings Error: {earningsLoading ? '⏳ Loading' : '✅ Done'}</p>
                    </div>
                    <div className="space-x-2">
                        {error.includes('login') ? (
                            <button
                                onClick={handleLoginRedirect}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                {t('login') || 'Login'}
                            </button>
                        ) : (
                            <button
                                onClick={fetchUserProfile}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                {t('tryAgain') || 'Try Again'}
                            </button>
                        )}
                        <button
                            onClick={onBack}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            {t('goBack') || 'Go Back'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const renderProfileTab = () => (
        <div className="space-y-6 w-full">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                        <p className="text-blue-100">{user?.mobile || 'No mobile'}</p>
                        <div className="flex items-center mt-1">
                            {user?.isVerified ? (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                    {t('verified')}
                                </span>
                            ) : (
                                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                                    {t('pendingVerification')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('personalInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-600">{t('fullName')}</label>
                        <p className="font-semibold">{user?.name || t('notProvided')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('mobileNumber')}</label>
                        <p className="font-semibold">{user?.mobile || t('notProvided')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('aadharNumber')}</label>
                        <p className="font-semibold">
                            {user?.aadharNumber ? `****-****-${user.aadharNumber.slice(-4)}` : t('notProvided')}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('licenseNumber')}</label>
                        <p className="font-semibold">{user?.licenseNumber || t('notProvided')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('vehicleNumber')}</label>
                        <p className="font-semibold">{user?.vehicleNumber || t('notProvided')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('emergencyContact')}</label>
                        <p className="font-semibold">{user?.emergencyContact || t('notProvided')}</p>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('documents')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'aadharCard', backendKey: 'aadharCard', labelKey: 'aadharCard' },
                        { key: 'drivingLicense', backendKey: 'drivingLicense', labelKey: 'drivingLicense' },
                        { key: 'vehicleRC', backendKey: 'vehicleRC', labelKey: 'vehicleRC' },
                        { key: 'profilePhoto', backendKey: 'profilePhoto', labelKey: 'profilePhoto' }
                    ].map(doc => (
                        <div key={doc.key} className="border rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">{t(doc.labelKey)}</p>
                            
                            {user?.documents?.[doc.backendKey] ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-600 text-sm">✓ {t('uploaded') || 'अपलोड किया गया'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {user.documents[doc.backendKey].fileName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(user.documents[doc.backendKey].uploadedAt).toLocaleDateString()}
                                    </p>
                                    
                                    {/* Replace document option */}
                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            id={`replace-${doc.key}`}
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(doc.backendKey, e)}
                                            className="hidden"
                                            disabled={uploadingDoc === doc.backendKey}
                                        />
                                        <label
                                            htmlFor={`replace-${doc.key}`}
                                            className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 disabled:opacity-50"
                                        >
                                            {uploadingDoc === doc.backendKey ? 'अपलोड हो रहा है...' : 'बदलें'}
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <span className="text-red-600 text-sm">✗ {t('notUploaded') || 'अपलोड नहीं किया गया'}</span>
                                    
                                    {/* Upload document */}
                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            id={`upload-${doc.key}`}
                                            accept="image/*,.pdf"
                                            onChange={(e) => handleFileChange(doc.backendKey, e)}
                                            className="hidden"
                                            disabled={uploadingDoc === doc.backendKey}
                                        />
                                        <label
                                            htmlFor={`upload-${doc.key}`}
                                            className="inline-block px-4 py-2 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploadingDoc === doc.backendKey ? 'अपलोड हो रहा है...' : 'अपलोड करें'}
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Upload progress */}
                            {uploadingDoc === doc.backendKey && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress[doc.backendKey] || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Upload instructions */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                        📄 {t('uploadInstructions') || 'केवल JPG, PNG या PDF फाइलें अपलोड करें (अधिकतम 5MB)'}
                    </p>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t('accountInformation')}</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">{t('memberSince')}</label>
                        <p className="font-semibold">{user?.createdAt ? formatDate(user.createdAt) : t('unknown')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('lastUpdated')}</label>
                        <p className="font-semibold">{user?.updatedAt ? formatDate(user.updatedAt) : t('unknown')}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">{t('preferredLanguage')}</label>
                        <p className="font-semibold">{user?.preferredLanguage || 'Hindi'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEarningsTab = () => (
        <div className="space-y-6 w-full">
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-green-800">{t('todaysEarningsTitle')}</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {formatCurrency((earnings?.today?.revenue || 0) - (earnings?.today?.expenses || 0))}
                    </p>
                    <div className="mt-2 text-sm text-green-700">
                        <p>{t('revenue')}: {formatCurrency(earnings?.today?.revenue || 0)}</p>
                        <p>{t('expenses')}: {formatCurrency(earnings?.today?.expenses || 0)}</p>
                        <p>{t('trips')}: {earnings?.today?.trips || 0}</p>
                    </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-800">{t('thisWeek')}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {formatCurrency((earnings?.lastWeek?.revenue || 0) - (earnings?.lastWeek?.expenses || 0))}
                    </p>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>{t('revenue')}: {formatCurrency(earnings?.lastWeek?.revenue || 0)}</p>
                        <p>{t('expenses')}: {formatCurrency(earnings?.lastWeek?.expenses || 0)}</p>
                        <p>{t('trips')}: {earnings?.lastWeek?.trips || 0}</p>
                    </div>
                </div>
            </div>

            {earningsLoading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t('loadingEarningsData')}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button onClick={onBack} className="flex items-center text-blue-600 font-semibold">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        {t('goBack') || 'Back'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => {
                            console.log('🔄 Switching to profile tab');
                            setActiveTab('profile');
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'profile'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        {t('profile') || 'Profile'} {activeTab === 'profile' && '✓'}
                    </button>
                    <button
                        onClick={() => {
                            console.log('🔄 Switching to earnings tab');
                            setActiveTab('earnings');
                        }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'earnings'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        {t('earnings') || 'Earnings'} {activeTab === 'earnings' && '✓'}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="pb-8">
                    {activeTab === 'profile' && renderProfileTab()}
                    {activeTab === 'earnings' && renderEarningsTab()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 