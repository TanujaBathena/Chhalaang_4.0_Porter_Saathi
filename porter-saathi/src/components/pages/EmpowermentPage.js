import React, { useState, useEffect, useRef, useCallback } from 'react';
import { processEmpowermentQuery, getQuickActions } from '../../modules/empowermentModule';

const EmpowermentPage = ({ language, t, speak }) => {
    
    // State management
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' or 'rights'
    const [recentQueries, setRecentQueries] = useState([]);
    
    // Voice recognition
    const recognitionRef = useRef(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    
    // Handle query processing
    const handleQuery = useCallback(async (queryText = query) => {
        if (!queryText.trim()) return;
        
        setIsProcessing(true);
        setError('');
        setResults(null);
        
        try {
            // Speak processing message
            const processingMessages = {
                'en-IN': 'Let me help you with that...',
                'hi-IN': 'मैं आपकी इसमें मदद करता हूं...',
                'te-IN': 'నేను దానిలో మీకు సహాయం చేస్తాను...',
                'ta-IN': 'நான் அதில் உங்களுக்கு உதவுகிறேன்...'
            };
            speak(processingMessages[language] || processingMessages['en-IN']);
            
            // Process the query
            const result = await processEmpowermentQuery(queryText, language, (status, message) => {
                setProcessingStatus(message);
            });
            
            if (result.success) {
                setResults(result);
                setActiveTab(result.type);
                
                // Speak the voice response
                speak(result.voiceResponse);
                
                // Add to recent queries
                setRecentQueries(prev => [
                    { query: queryText, timestamp: new Date(), type: result.type },
                    ...prev.slice(0, 4) // Keep only 5 recent queries
                ]);
            } else {
                setError(result.error);
                speak(result.voiceResponse);
            }
        } catch (err) {
            console.error('Query processing error:', err);
            setError('Something went wrong. Please try again.');
            speak('Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    }, [language, speak, query]);
    
    // Initialize voice recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language;
            
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice transcript received:', transcript);
                setQuery(transcript);
                setIsVoiceActive(false);
                handleQuery(transcript);
            };
            
            recognitionRef.current.onend = () => {
                setIsVoiceActive(false);
                console.log('Voice recognition ended');
            };
            
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsVoiceActive(false);
                
                const errorMessages = {
                    'en-IN': 'Voice recognition error. Please try again.',
                    'hi-IN': 'आवाज पहचानने में त्रुटि। कृपया फिर से कोशिश करें।',
                    'te-IN': 'వాయిస్ గుర్తింపు లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.',
                    'ta-IN': 'குரல் அடையாளம் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
                };
                speak(errorMessages[language] || errorMessages['en-IN']);
            };
        }
    }, [language, handleQuery]);
    
    // Start voice input
    const startVoiceInput = () => {
        if (recognitionRef.current && !isVoiceActive) {
            console.log('Starting voice recognition...');
            setIsVoiceActive(true);
            
            const voicePrompts = {
                'en-IN': 'I am listening. Ask me about vehicle loans, government schemes, or your rights.',
                'hi-IN': 'मैं सुन रहा हूं। मुझसे वाहन लोन, सरकारी योजनाओं या अपने अधिकारों के बारे में पूछें।',
                'te-IN': 'నేను వింటున్నాను. వాహన లోన్లు, ప్రభుత్వ పథకాలు లేదా మీ హక్కుల గురించి అడగండి.',
                'ta-IN': 'நான் கேட்டுக்கொண்டிருக்கிறேன். வாகன கடன்கள், அரசு திட்டங்கள் அல்லது உங்கள் உரிமைகள் பற்றி கேளுங்கள்.'
            };
            
            speak(voicePrompts[language] || voicePrompts['en-IN']);
            
            // Start recognition after a short delay to let the prompt finish
            setTimeout(() => {
                if (recognitionRef.current && isVoiceActive) {
                    try {
                        recognitionRef.current.start();
                        console.log('Voice recognition started');
                    } catch (error) {
                        console.error('Error starting voice recognition:', error);
                        setIsVoiceActive(false);
                    }
                }
            }, 3000);
        }
    };
    
    // Handle quick action
    const handleQuickAction = (action) => {
        setQuery(action.query);
        handleQuery(action.query);
    };
    
    // Get quick actions for current language
    const quickActions = getQuickActions(language);
    
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl">💪</span>
                        <h1 className="text-2xl font-bold">{t('empowermentTitle') || 'Driver Empowerment'}</h1>
                    </div>
                    <p className="text-blue-100">
                        {t('empowermentSubtitle') || 'Know your rights, access government schemes'}
                    </p>
                </div>
                
                {/* Query Input Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-xl">🎤</span>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {t('empowermentVoiceInstructions') || 'You can also ask me by voice'}
                        </h2>
                    </div>
                    
                    {/* Text Input */}
                    <div className="flex space-x-3 mb-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={language === 'hi-IN' ? 'अपना प्रश्न यहां लिखें...' : 
                                       language === 'te-IN' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...' :
                                       language === 'ta-IN' ? 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்...' :
                                       'Type your question here...'}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                            disabled={isProcessing}
                        />
                        <button
                            onClick={() => handleQuery()}
                            disabled={isProcessing || !query.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? '⏳' : '🔍'}
                        </button>
                    </div>
                    
                    {/* Voice Input Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={startVoiceInput}
                            disabled={isProcessing || isVoiceActive}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                isVoiceActive 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'bg-green-500 text-white hover:bg-green-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isVoiceActive ? '🎤 Listening...' : '🎤 Ask by Voice'}
                        </button>
                    </div>
                    
                    {/* Example Voice Query */}
                    <div className="mt-3 text-center text-sm text-gray-600">
                        <p>{t('empowermentExampleVoice') || 'Example: "Mujhe truck upgrade ke liye loan chahiye"'}</p>
                    </div>
                </div>
                
                {/* Processing Status */}
                {isProcessing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700">
                                {processingStatus || (t('processingEmpowerment') || 'Getting information for you...')}
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-red-600">⚠️</span>
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}
                
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-xl">⚡</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {t('quickActions') || 'Quick Actions'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                disabled={isProcessing}
                                className="p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                            >
                                <span className="text-sm font-medium text-gray-800">{action.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Results Display */}
                {results && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        {/* Tab Navigation */}
                        <div className="flex space-x-4 mb-6 border-b">
                            <button
                                onClick={() => setActiveTab('schemes')}
                                className={`pb-2 px-1 font-medium ${
                                    activeTab === 'schemes' 
                                        ? 'text-blue-600 border-b-2 border-blue-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('governmentSchemes') || 'Government Schemes'}
                                {results.type === 'schemes' && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {results.totalFound} {t('schemesFound') || 'found'}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('rights')}
                                className={`pb-2 px-1 font-medium ${
                                    activeTab === 'rights' 
                                        ? 'text-purple-600 border-b-2 border-purple-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('driverRights') || 'Driver Rights'}
                                {results.type === 'rights' && (
                                    <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        {results.totalFound} {t('rightsFound') || 'found'}
                                    </span>
                                )}
                            </button>
                        </div>
                        
                        {/* Schemes Results */}
                        {activeTab === 'schemes' && results.schemes && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                    <span>📋</span>
                                    <span>{t('availableSchemes') || 'Available Schemes'}</span>
                                </h3>
                                {results.schemes.map((scheme, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-600 mb-2">{scheme.name}</h4>
                                        <p className="text-gray-700 mb-3">{scheme.description}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">{t('subsidy') || 'Subsidy'}:</span>
                                                <p className="text-green-600 font-medium">{scheme.subsidy}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">{t('processingTime') || 'Processing Time'}:</span>
                                                <p>{scheme.processingTime}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">{t('eligibility') || 'Eligibility'}:</span>
                                                <p>{scheme.eligibility}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">{t('contact') || 'Contact'}:</span>
                                                <p>{scheme.contact}</p>
                                            </div>
                                        </div>
                                        
                                        {scheme.documents && (
                                            <div className="mt-3">
                                                <span className="font-medium text-gray-600">{t('requiredDocuments') || 'Required Documents'}:</span>
                                                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                                                    {scheme.documents.map((doc, idx) => (
                                                        <li key={idx}>{doc}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                            {t('applyNow') || 'Apply Now'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Rights Results */}
                        {activeTab === 'rights' && results.rights && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                    <span>⚖️</span>
                                    <span>{t('yourRights') || 'Your Rights'}</span>
                                </h3>
                                {results.rights.map((right, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-purple-600 mb-2">{right.title}</h4>
                                        <p className="text-gray-700 mb-3">{right.description}</p>
                                        
                                        <div className="mb-3">
                                            <span className="font-medium text-gray-600">{t('legalBasis') || 'Legal Basis'}:</span>
                                            <p className="text-sm text-gray-700">{right.legalBasis}</p>
                                        </div>
                                        
                                        {right.howToExercise && (
                                            <div className="mb-3">
                                                <span className="font-medium text-gray-600">{t('howToExercise') || 'How to Exercise This Right'}:</span>
                                                <ul className="list-decimal list-inside text-sm text-gray-700 mt-1">
                                                    {right.howToExercise.map((step, idx) => (
                                                        <li key={idx}>{step}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {right.contactForHelp && (
                                            <div>
                                                <span className="font-medium text-gray-600">{t('contactForHelp') || 'Contact for Help'}:</span>
                                                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                                                    {right.contactForHelp.map((contact, idx) => (
                                                        <li key={idx}>{contact}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* Recent Queries */}
                {recentQueries.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-xl">📝</span>
                            <h3 className="text-lg font-semibold text-gray-800">
                                {t('recentQueries') || 'Recent Queries'}
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {recentQueries.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuery(item.query)}
                                    disabled={isProcessing}
                                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">{item.query}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            item.type === 'schemes' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {item.type}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpowermentPage;