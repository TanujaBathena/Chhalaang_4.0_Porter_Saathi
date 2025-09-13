import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing OCR auto-fill voice confirmation process
 * This hook handles the step-by-step voice confirmation of auto-filled fields
 */
export const useOCRVoiceConfirmation = (speak, t) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [confirmationResults, setConfirmationResults] = useState({});
    const [isListening, setIsListening] = useState(false);
    
    const recognitionRef = useRef(null);
    const fieldsToConfirmRef = useRef([]);
    const onCompleteRef = useRef(null);

    // Initialize speech recognition
    const initializeSpeechRecognition = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Can be made dynamic based on selected language
        recognition.maxAlternatives = 1;

        return recognition;
    }, []);

    // Complete the confirmation process
    const completeConfirmation = useCallback(() => {
        setIsConfirming(false);
        setCurrentFieldIndex(0);
        setIsListening(false);
        
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }

        speak(t('allFieldsConfirmed'));
        
        if (onCompleteRef.current) {
            onCompleteRef.current(confirmationResults);
        }
    }, [confirmationResults, speak, t]);

    // Start listening for voice confirmation
    const startListeningForCurrentField = useCallback(() => {
        if (!recognitionRef.current) {
            recognitionRef.current = initializeSpeechRecognition();
            if (!recognitionRef.current) {
                console.error('Speech recognition not available');
                return;
            }
        }

        const recognition = recognitionRef.current;
        
        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice confirmation transcript:', transcript);
            processVoiceResponse(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            
            // Retry after error
            setTimeout(() => {
                speak('I could not hear you clearly. Please try again.');
                setTimeout(() => {
                    startListeningForCurrentField();
                }, 1500);
            }, 1000);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            setIsListening(false);
        }
    }, [initializeSpeechRecognition, speak]);

    // Process voice response for confirmation
    const processVoiceResponse = useCallback((transcript) => {
        const response = transcript.toLowerCase().trim();
        const currentField = fieldsToConfirmRef.current[currentFieldIndex];
        
        // Check for positive responses
        const positiveResponses = ['yes', 'yeah', 'yep', 'correct', 'right', 'ok', 'okay', 'हाँ', 'हां', 'सही', 'అవును', 'సరి', 'ஆம்', 'சரி'];
        const negativeResponses = ['no', 'nope', 'wrong', 'incorrect', 'edit', 'change', 'ना', 'नहीं', 'गलत', 'కాదు', 'తప్పు', 'இல்லை', 'தவறு'];
        
        const isPositive = positiveResponses.some(word => response.includes(word));
        const isNegative = negativeResponses.some(word => response.includes(word));
        
        if (isPositive) {
            // Field confirmed
            setConfirmationResults(prev => ({
                ...prev,
                [currentField.key]: { confirmed: true, value: currentField.value }
            }));
            
            speak(t('fieldConfirmed'));
            
            // Move to next field or complete
            setTimeout(() => {
                if (currentFieldIndex < fieldsToConfirmRef.current.length - 1) {
                    setCurrentFieldIndex(prev => prev + 1);
                } else {
                    completeConfirmation();
                }
            }, 1500);
            
        } else if (isNegative) {
            // Field needs editing
            setConfirmationResults(prev => ({
                ...prev,
                [currentField.key]: { confirmed: false, needsEdit: true, value: currentField.value }
            }));
            
            speak(t('fieldNeedsEdit'));
            
            // Move to next field after a delay
            setTimeout(() => {
                if (currentFieldIndex < fieldsToConfirmRef.current.length - 1) {
                    setCurrentFieldIndex(prev => prev + 1);
                } else {
                    completeConfirmation();
                }
            }, 2000);
            
        } else {
            // Unclear response, ask again
            speak('I did not understand. Please say yes to confirm or no to edit this field.');
            setTimeout(() => {
                startListeningForCurrentField();
            }, 2000);
        }
    }, [currentFieldIndex, speak, t, completeConfirmation, startListeningForCurrentField]);

    // Speak current field confirmation
    const speakCurrentFieldConfirmation = useCallback(() => {
        const currentField = fieldsToConfirmRef.current[currentFieldIndex];
        if (!currentField) return;

        let confirmationMessage = '';
        
        switch (currentField.key) {
            case 'name':
                confirmationMessage = t('nameConfirmation').replace('{name}', currentField.value);
                break;
            case 'aadharNumber':
                // Format Aadhaar number for better speech
                const formattedAadhaar = currentField.value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
                confirmationMessage = t('aadhaarConfirmation').replace('{aadhaar}', formattedAadhaar);
                break;
            default:
                confirmationMessage = `${currentField.label} is filled as: ${currentField.value}. Is this correct? Say yes to confirm or no to edit.`;
        }

        speak(confirmationMessage);
        
        // Start listening after speaking
        setTimeout(() => {
            startListeningForCurrentField();
        }, 3000); // Wait for speech to complete
    }, [currentFieldIndex, speak, t, startListeningForCurrentField]);

    // Start the voice confirmation process
    const startVoiceConfirmation = useCallback((fieldsToConfirm, onComplete) => {
        if (!fieldsToConfirm || fieldsToConfirm.length === 0) {
            console.warn('No fields to confirm');
            return;
        }

        fieldsToConfirmRef.current = fieldsToConfirm;
        onCompleteRef.current = onComplete;
        
        setIsConfirming(true);
        setCurrentFieldIndex(0);
        setConfirmationResults({});
        
        // Start with introduction message
        speak(t('confirmAutoFilledData'));
        
        // Begin confirmation process after introduction
        setTimeout(() => {
            speakCurrentFieldConfirmation();
        }, 4000);
    }, [speak, t, speakCurrentFieldConfirmation]);

    // Skip voice confirmation
    const skipVoiceConfirmation = useCallback(() => {
        setIsConfirming(false);
        setCurrentFieldIndex(0);
        setIsListening(false);
        
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }

        // Mark all fields as confirmed
        const allConfirmed = {};
        fieldsToConfirmRef.current.forEach(field => {
            allConfirmed[field.key] = { confirmed: true, value: field.value };
        });
        
        if (onCompleteRef.current) {
            onCompleteRef.current(allConfirmed);
        }
    }, []);

    // Stop current voice confirmation
    const stopVoiceConfirmation = useCallback(() => {
        setIsConfirming(false);
        setCurrentFieldIndex(0);
        setIsListening(false);
        
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }
    }, []);

    // Move to next field manually
    const moveToNextField = useCallback(() => {
        if (currentFieldIndex < fieldsToConfirmRef.current.length - 1) {
            setCurrentFieldIndex(prev => prev + 1);
            setTimeout(() => {
                speakCurrentFieldConfirmation();
            }, 500);
        } else {
            completeConfirmation();
        }
    }, [currentFieldIndex, speakCurrentFieldConfirmation, completeConfirmation]);

    // Confirm current field manually
    const confirmCurrentField = useCallback((confirmed = true) => {
        const currentField = fieldsToConfirmRef.current[currentFieldIndex];
        
        setConfirmationResults(prev => ({
            ...prev,
            [currentField.key]: { confirmed, value: currentField.value, needsEdit: !confirmed }
        }));
        
        speak(confirmed ? t('fieldConfirmed') : t('fieldNeedsEdit'));
        
        setTimeout(() => {
            moveToNextField();
        }, 1500);
    }, [currentFieldIndex, speak, t, moveToNextField]);

    return {
        isConfirming,
        currentFieldIndex,
        confirmationResults,
        isListening,
        startVoiceConfirmation,
        skipVoiceConfirmation,
        stopVoiceConfirmation,
        confirmCurrentField,
        moveToNextField,
        currentField: fieldsToConfirmRef.current[currentFieldIndex] || null
    };
};
