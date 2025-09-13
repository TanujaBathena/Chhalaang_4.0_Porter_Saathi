import React, { useState, useEffect } from 'react';
import { useVoiceInstructions } from '../hooks/useVoiceInstructions';

const LogoutPage = ({ language, onConfirmLogout, onCancelLogout, t, speak, stopVoice }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [voiceGuidanceActive, setVoiceGuidanceActive] = useState(false);

    // Use voice instruction management hook
    const { speakOnce } = useVoiceInstructions(speak);

    // Speak logout confirmation when component mounts - only once
    useEffect(() => {
        const logoutMsg = t('logoutConfirmation');
        speakOnce(logoutMsg);
    }, [t, speakOnce]);
    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        speak(t('loggingOut'));
        
        // Simulate logout process
        setTimeout(() => {
            setIsLoggingOut(false);
            speak(t('logoutSuccess'));
            onConfirmLogout();
        }, 2000);
    };
    const handleCancelLogout = () => {
        speak(t('logoutCancelled'));
        onCancelLogout();
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
                    <h2 className="text-xl font-semibold text-gray-700">{t('logoutTitle')}</h2>
                </div>
                {renderVoiceControls()}
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <span className="text-6xl">👋</span>
                    </div>
                    <p className="text-lg text-gray-700 mb-4">
                        {t('logoutMessage')}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('logoutSubMessage')}
                    </p>
                </div>
                {isLoggingOut ? (
                    <div className="text-center">
                        <div className="inline-flex items-center px-6 py-3 text-blue-600">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="font-medium">{t('loggingOut')}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={handleConfirmLogout}
                            className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">🚪</span>
                            {t('confirmLogout')}
                        </button>
                        
                        <button
                            onClick={handleCancelLogout}
                            className="w-full bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                            <span className="mr-2">↩️</span>
                            {t('cancelLogout')}
                        </button>
                    </div>
                )}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        {t('thankYouMessage')}
                    </p>
                </div>
            </div>
        </div>
    );
};
export default LogoutPage;
