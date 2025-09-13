import React, { useState, useEffect, useCallback, useRef } from 'react';

const SurakshaPage = ({ speak, t, language, audioPlayer, recognition }) => {
    const [emergencyState, setEmergencyState] = useState('idle'); // idle, confirming, confirmed
    const [locationAlert, setLocationAlert] = useState('');
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);
    const emergencyRecognizerRef = useRef(null);

    // Memoize handlers to prevent re-creation on re-renders
    const confirmEmergency = useCallback(() => {
        setEmergencyState('confirmed');
        // Calming message first
        const calmingMessage = `${t('stayCalm')} ${t('breatheSlowly')} ${t('emergencyHelp')}`;
        speak(calmingMessage);
    }, [speak, t]);

    const cancelEmergency = useCallback(() => {
        setEmergencyState('idle');
        speak(t('requestCancelled'));
    }, [speak, t]);

    const handleEmergencyResponse = useCallback((transcript) => {
        // Ensure recognizer is stopped once a response is processed.
        if (emergencyRecognizerRef.current) {
            emergencyRecognizerRef.current.stop();
        }

        const affirmation = transcript.toLowerCase();
        const yesWord = t('yes').toLowerCase();

        // Check for common affirmative words across languages
        if (affirmation.includes('yes') || affirmation.includes('haan') || affirmation.includes(yesWord)) {
            confirmEmergency();
        } else {
            cancelEmergency();
        }
    }, [t, confirmEmergency, cancelEmergency]);

    const startEmergencyListener = useCallback(() => {
        if (!recognition) return;

        // Clean up any existing recognizer
        if (emergencyRecognizerRef.current) {
            emergencyRecognizerRef.current.stop();
        }

        const recognizer = new recognition();
        emergencyRecognizerRef.current = recognizer; // Store the instance

        recognizer.lang = language;
        recognizer.interimResults = false;

        recognizer.start();

        recognizer.onresult = (event) => {
            handleEmergencyResponse(event.results[0][0].transcript);
        };

        recognizer.onerror = (event) => {
            console.error("Emergency confirmation listener error:", event.error);
            // Don't cancel on no-speech, let it time out or be cancelled by user
            if (event.error !== 'no-speech') {
                cancelEmergency();
            }
        };

        recognizer.onend = () => {
            if (emergencyRecognizerRef.current === recognizer) {
                emergencyRecognizerRef.current = null;
            }
        };

    }, [recognition, language, handleEmergencyResponse, cancelEmergency]);

    const handleEmergency = () => {
        setEmergencyState('confirming');
        const confirmationText = t('emergencyConfirm');

        const onAudioEnd = () => {
            startEmergencyListener();
            audioPlayer.removeEventListener('ended', onAudioEnd);
        };
        audioPlayer.addEventListener('ended', onAudioEnd);

        speak(confirmationText);
    };

    // Cleanup effect to stop the recognizer if the component unmounts
    useEffect(() => {
        return () => {
            if (emergencyRecognizerRef.current) {
                emergencyRecognizerRef.current.stop();
                emergencyRecognizerRef.current = null;
            }
        };
    }, []);

    const handleLocationCheck = () => {
        if (!navigator.geolocation) {
            const errorMsg = t('locationError');
            setLocationAlert(errorMsg);
            speak(errorMsg);
            return;
        }

        setIsCheckingLocation(true);
        setLocationAlert(t('gettingLocation'));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Mocking alerts based on Bengaluru coordinates
                let alertMsg = '';
                if (latitude > 12.95 && latitude < 12.97 && longitude > 77.59 && longitude < 77.61) {
                    alertMsg = t('schoolZoneAlert');
                }
                else if (latitude > 12.79 && latitude < 12.81 && longitude > 77.56 && longitude < 77.58) {
                    alertMsg = t('forestZoneAlert');
                }
                else if (latitude > 12.91 && latitude < 12.93 && longitude > 77.61 && longitude < 77.63) {
                    alertMsg = t('badRoadAlert');
                }
                else {
                    alertMsg = t('goodRoadAhead');
                }
                setLocationAlert(alertMsg);
                speak(alertMsg);
                setIsCheckingLocation(false);
            },
            (error) => {
                let errorMsg = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = t('locationPermissionDenied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = t('locationUnavailable');
                        break;
                    case error.TIMEOUT:
                        errorMsg = t('locationTimeout');
                        break;
                    default:
                        errorMsg = t('locationError');
                        break;
                }
                setLocationAlert(errorMsg);
                speak(errorMsg);
                setIsCheckingLocation(false);
            }
        );
    };

    return (
        <div className="p-4 text-center space-y-8">
            <h2 className="text-xl font-bold mb-4">{t('surakshaTitle')}</h2>

            {emergencyState === 'idle' && (
                <div onClick={handleEmergency} className="bg-red-500 text-white rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 transition-colors animate-pulse">
                    <span className="text-5xl">🆘</span><span className="text-2xl font-bold mt-2">{t('help')}</span>
                </div>
            )}
            {emergencyState === 'confirming' && (
                <div className="bg-yellow-100 border-4 border-yellow-400 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-800">{t('emergencyQuery')}</h3>
                    <div className="mt-4 flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        <p className="mt-4 text-gray-700 font-semibold">{t('emergencyHelpQuery')}</p>
                    </div>
                </div>
            )}
            {emergencyState === 'confirmed' && (
                <div className="bg-green-100 border-4 border-green-400 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-800">{t('requestSentTitle')}</h3>
                    <p className="mt-2 text-gray-700">{t('helpOnWay')}</p>
                    
                    {/* Emergency Contacts Section */}
                    <div className="mt-6 bg-white rounded-lg p-4 border-2 border-red-200">
                        <h4 className="text-lg font-bold text-red-800 mb-4">{t('emergencyContacts')}</h4>
                        <div className="space-y-3">
                            {/* Ambulance */}
                            <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-200">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">🚑</span>
                                    <span className="font-semibold text-red-800">{t('ambulance')}</span>
                                </div>
                                <a href="tel:108" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                                    108 - {t('callNow')}
                                </a>
                            </div>
                            
                            {/* Police */}
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">👮</span>
                                    <span className="font-semibold text-blue-800">{t('police')}</span>
                                </div>
                                <a href="tel:100" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                    100 - {t('callNow')}
                                </a>
                            </div>
                            
                            {/* Fire Brigade */}
                            <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">🚒</span>
                                    <span className="font-semibold text-orange-800">{t('fireBrigade')}</span>
                                </div>
                                <a href="tel:101" className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 transition-colors">
                                    101 - {t('callNow')}
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setEmergencyState('idle')} className="mt-6 bg-gray-400 text-white font-bold py-3 px-8 rounded-lg">{t('cancel')}</button>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h3 className="font-bold text-gray-800">{t('locationAlerts')}</h3>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 my-4 min-h-[4rem] flex items-center justify-center">
                    <p className="text-center text-gray-600 font-medium">{locationAlert || 'Press button to check for alerts.'}</p>
                </div>
                <button onClick={handleLocationCheck} disabled={isCheckingLocation} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full flex items-center justify-center disabled:bg-blue-300">
                    {isCheckingLocation ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {t('checkLocation')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SurakshaPage; 