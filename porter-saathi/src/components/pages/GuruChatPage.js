import React, { useRef, useEffect, useState } from 'react';
import VideoPlayer from '../VideoPlayer';
import { useTutorials } from '../../hooks/useTutorials';

const GuruChatPage = ({ chatHistory, isLoading, t, onBack, language, onEmergency, speak, onListen, isListening }) => {
    const [showVideo, setShowVideo] = useState(null);
    const chatEndRef = useRef(null);
    const { tutorials } = useTutorials();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // Check for emergency keywords in the latest user message
    useEffect(() => {
        if (chatHistory.length > 0) {
            const lastMessage = chatHistory[chatHistory.length - 1];
            if (lastMessage.sender === 'user') {
                const messageText = lastMessage.text.toLowerCase();
                
                // Check for specific emergency number requests first
                const ambulanceKeywords = ['ambulance', 'एम्बुलेंस', 'అంబులెన్స్', 'ஆம்புலன்ஸ்'];
                const policeKeywords = ['police', 'पुलिस', 'పోలీస్', 'காவல்துறை'];
                const fireKeywords = ['fire', 'fire brigade', 'आग', 'फायर', 'फायर ब्रिगेड', 'అగ్ని', 'ఫైర్', 'ఫైర్ బ్రిగేడ్', 'தீ', 'தீயணைப்பு'];
                
                const isAskingAmbulance = ambulanceKeywords.some(keyword => messageText.includes(keyword)) && (messageText.includes('number') || messageText.includes('नंबर') || messageText.includes('నంబర్') || messageText.includes('எண்'));
                const isAskingPolice = policeKeywords.some(keyword => messageText.includes(keyword)) && (messageText.includes('number') || messageText.includes('नंबर') || messageText.includes('నంబర్') || messageText.includes('எண்'));
                const isAskingFire = fireKeywords.some(keyword => messageText.includes(keyword)) && (messageText.includes('number') || messageText.includes('नंबर') || messageText.includes('నంబర్') || messageText.includes('எண்'));
                
                // If asking for specific numbers, let the AI handle it naturally
                if (isAskingAmbulance || isAskingPolice || isAskingFire) {
                    return; // Let the normal AI response handle specific number requests
                }
                
                // Check for general emergency situations
                const emergencyKeywords = ['emergency', 'help', 'accident', 'urgent', 'danger', 'hurt', 'injured', 'medical', 'इमरजेंसी', 'मदद', 'एक्सीडेंट', 'चोट', 'అత్యవసరం', 'సహాయం', 'ప్రమాదం', 'గాయం', 'அவசரம்', 'உதவி', 'விபத்து', 'காயம்'];
                
                const isEmergency = emergencyKeywords.some(keyword => messageText.includes(keyword));
                
                if (isEmergency && onEmergency && speak) {
                    // Provide calming response and redirect
                    const emergencyResponse = `${t('stayCalm')} ${t('emergencyDetected')}`;
                    speak(emergencyResponse);
                    setTimeout(() => {
                        onEmergency();
                    }, 2000); // Give time for the calming message to play
                }
            }
        }
    }, [chatHistory, onEmergency, speak, t]);

    // Function to suggest relevant videos based on chat content
    const getSuggestedVideos = () => {
        // Show videos if there's at least one AI response
        const hasAIResponse = chatHistory.some(msg => msg.sender === 'ai');
        if (!hasAIResponse) return [];
        
        // Get more context from recent messages (last 5 messages for better context)
        const lastMessages = chatHistory.slice(-5).map(msg => msg.text.toLowerCase());
        const allText = lastMessages.join(' ');
        
        // Negative keywords that indicate irrelevant contexts
        const negativeKeywords = [
            'weather', 'temperature', 'rain', 'sunny', 'cloudy',
            'food', 'restaurant', 'eat', 'drink', 'meal',
            'movie', 'entertainment', 'music', 'song',
            'family', 'personal', 'health', 'doctor',
            'मौसम', 'खाना', 'फिल्म', 'परिवार',
            'వాతావరణం', 'ఆహారం', 'సినిమా', 'కుటుంబం',
            'வானிலை', 'உணவு', 'திரைப்படம்', 'குடும்பம்'
        ];
        
        // Check for negative keywords that indicate irrelevant conversation
        const hasNegativeKeywords = negativeKeywords.some(keyword => allText.includes(keyword));
        if (hasNegativeKeywords) {
            console.log('🚫 Negative keywords detected, skipping video suggestions');
            return [];
        }
        
        // Enhanced keyword matching with multilingual support and better context
        let relevantVideos = tutorials.filter(tutorial => {
            const category = tutorial.category.toLowerCase();
            
            // Traffic Challan related keywords (English, Hindi, Telugu, Tamil)
            const challanKeywords = [
                'challan', 'fine', 'penalty', 'violation', 'ticket',
                'चालान', 'जुर्माना', 'फाइन', 'पेनल्टी',
                'చలాన్', 'ఫైన్', 'పెనాల్టీ', 'జరిమానా',
                'சலான்', 'அபராதம்', 'டிக்கெட்'
            ];
            
            // Traffic context keywords (require additional context)
            const trafficContextKeywords = [
                'traffic', 'ट्रैफिक', 'ట్రాఫిక్', 'போக்குவரத்து'
            ];
            
            // Insurance related keywords
            const insuranceKeywords = [
                'insurance', 'claim', 'accident', 'damage', 'crash', 'collision', 'repair',
                'बीमा', 'क्लेम', 'दुर्घटना', 'नुकसान', 'एक्सीडेंट',
                'భీమా', 'క్లెయిమ్', 'ప్రమాదం', 'నష్టం', 'యాక్సిడెంట్',
                'காப்பீடு', 'கோரிக்கை', 'விபத்து', 'சேதம்', 'ஆக்சிடென்ட்'
            ];
            
            // DigiLocker related keywords
            const digilockerKeywords = [
                'digilocker', 'document', 'papers', 'license', 'registration', 'rc', 'dl',
                'डिजिलॉकर', 'दस्तावेज़', 'कागज़ात', 'लाइसेंस', 'रजिस्ट्रेशन',
                'డిజిలాకర్', 'పత్రాలు', 'డాక్యుమెంట్', 'లైసెన్స్', 'రిజిస్ట్రేషన్',
                'டிஜிலாக்கர்', 'ஆவணங்கள்', 'காகிதங்கள்', 'உரிமம்', 'பதிவு'
            ];
            
            // Customer service related keywords
            const customerKeywords = [
                'customer', 'service', 'behavior', 'talk', 'communication', 'rude', 'polite', 'manner',
                'ग्राहक', 'सेवा', 'व्यवहार', 'बात', 'संवाद', 'शिष्टाचार',
                'కస్టమర్', 'సేవ', 'ప్రవర్తన', 'మాట్లాడటం', 'సంభాషణ', 'మర్యాద',
                'வாடிக்கையாளர்', 'சேவை', 'நடத்தை', 'பேச்சு', 'தொடர்பு', 'மரியாதை'
            ];
            
            // Check for keyword matches with VERY high precision - require multiple matches
            if (category === 'challan') {
                // For challan, require either direct challan keywords OR traffic + penalty/fine context
                const hasChallanKeywords = challanKeywords.some(keyword => allText.includes(keyword));
                const hasTrafficContext = trafficContextKeywords.some(keyword => allText.includes(keyword));
                const hasPenaltyContext = allText.includes('fine') || allText.includes('penalty') || 
                                        allText.includes('pay') || allText.includes('violation') ||
                                        allText.includes('जुर्माना') || allText.includes('पेनल्टी') ||
                                        allText.includes('జరిమానా') || allText.includes('అपराधం');
                
                // Require stronger evidence for challan videos
                const challanMatch = hasChallanKeywords || (hasTrafficContext && hasPenaltyContext);
                
                // Additional validation: ensure it's actually about paying/handling challans
                const hasActionContext = allText.includes('pay') || allText.includes('how') || 
                                       allText.includes('help') || allText.includes('process') ||
                                       allText.includes('कैसे') || allText.includes('भुगतान') ||
                                       allText.includes('ఎలా') || allText.includes('చెల్లించు') ||
                                       allText.includes('எப்படி') || allText.includes('செலுத்து');
                
                return challanMatch && hasActionContext;
            }
            if (category === 'insurance') {
                const hasInsuranceKeywords = insuranceKeywords.some(keyword => allText.includes(keyword));
                // Require action context for insurance too
                const hasActionContext = allText.includes('claim') || allText.includes('how') || 
                                       allText.includes('help') || allText.includes('process') ||
                                       allText.includes('क्लेम') || allText.includes('कैसे') ||
                                       allText.includes('క్లెయిమ్') || allText.includes('ఎలా') ||
                                       allText.includes('கோரிக்கை') || allText.includes('எப்படி');
                
                return hasInsuranceKeywords && hasActionContext;
            }
            if (category === 'digilocker') {
                const hasDigilockerKeywords = digilockerKeywords.some(keyword => allText.includes(keyword));
                // Require setup/access context
                const hasActionContext = allText.includes('setup') || allText.includes('access') || 
                                       allText.includes('how') || allText.includes('help') ||
                                       allText.includes('सेटअप') || allText.includes('कैसे') ||
                                       allText.includes('సెటప్') || allText.includes('ఎలా') ||
                                       allText.includes('அமைப்பு') || allText.includes('எப்படி');
                
                return hasDigilockerKeywords && hasActionContext;
            }
            if (category === 'customer') {
                const hasCustomerKeywords = customerKeywords.some(keyword => allText.includes(keyword));
                // Require service/behavior context
                const hasServiceContext = allText.includes('service') || allText.includes('behavior') || 
                                        allText.includes('rude') || allText.includes('polite') ||
                                        allText.includes('सेवा') || allText.includes('व्यवहार') ||
                                        allText.includes('సేవ') || allText.includes('ప్రవర్తన') ||
                                        allText.includes('சேவை') || allText.includes('நடத்தை');
                
                return hasCustomerKeywords && hasServiceContext;
            }
            
            return false;
        });
        
        // Additional context-based filtering for better relevance
        if (relevantVideos.length > 0) {
            // Score videos based on keyword frequency and recency
            relevantVideos = relevantVideos.map(video => {
                let score = 0;
                const category = video.category.toLowerCase();
                
                // Count keyword matches in recent messages (more recent = higher weight)
                lastMessages.forEach((message, index) => {
                    const weight = index + 1; // More recent messages get higher weight
                    
                    if (category === 'challan') {
                        const matches = (message.match(/challan|fine|penalty|violation|ticket|चालान|जुर्माना|చలాన్|சலான்/g) || []).length;
                        score += matches * weight;
                    } else if (category === 'insurance') {
                        const matches = (message.match(/insurance|claim|accident|damage|crash|collision|repair|बीमा|क्लेम|భీమా|காப்பீடு/g) || []).length;
                        score += matches * weight;
                    } else if (category === 'digilocker') {
                        const matches = (message.match(/digilocker|document|papers|license|registration|rc|dl|डिजिलॉकर|दस्तावेज़|డిజిలాకర్|டிஜிலாக்கர்/g) || []).length;
                        score += matches * weight;
                    } else if (category === 'customer') {
                        const matches = (message.match(/customer|service|behavior|communication|rude|polite|manner|ग्राहक|सेवा|కస్టమర్|வாடிக்கையாளர்/g) || []).length;
                        score += matches * weight;
                    }
                });
                
                return { ...video, relevanceScore: score };
            });
            
            // Sort by relevance score and return top matches
            relevantVideos.sort((a, b) => b.relevanceScore - a.relevanceScore);
            
            // STRICTER FILTERING: Only return videos with a HIGHER minimum relevance score
            // Require at least 2 points to ensure strong relevance
            relevantVideos = relevantVideos.filter(video => video.relevanceScore >= 2);
        }
        
        // ULTRA STRICT: Only return videos that are actually relevant to the conversation
        // If no videos meet the strict criteria, return empty array (no fallback)
        const finalVideos = relevantVideos.slice(0, 2); // Limit to top 2 most relevant videos
        
        console.log('🎯 Video filtering results:', {
            totalTutorials: tutorials.length,
            initialMatches: relevantVideos.length,
            finalSuggestions: finalVideos.length,
            suggestions: finalVideos.map(v => ({ category: v.category, score: v.relevanceScore }))
        });
        
        return finalVideos;
    };

    const suggestedVideos = getSuggestedVideos();
    const langKey = language ? language.split('-')[0] : 'en';
    
    // Debug logging
    console.log('Chat History:', chatHistory);
    console.log('Suggested Videos:', suggestedVideos);

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="flex items-center text-blue-600 font-semibold">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    {t('goBack')}
                </button>
                <h2 className="text-xl font-bold text-center flex-grow">{t('guruChatTitle')}</h2>
            </div>
            <div className="flex-grow bg-gray-100 rounded-lg p-4 space-y-4 overflow-y-auto">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">DP</div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-green-200' : 'bg-white shadow-sm'}`}>
                            <p className="text-sm text-gray-800">{msg.text}</p>
                        </div>
                    </div>
                ))}
                
                {/* Video Suggestions */}
                {suggestedVideos.length > 0 && !isLoading && (
                    <div className="flex justify-start items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">DP</div>
                        <div className="max-w-xs md:max-w-md">
                            <div className="bg-white shadow-sm rounded-lg p-3 mb-2">
                                <p className="text-sm text-gray-800 mb-2">{t('videoTutorial')}:</p>
                            </div>
                            {suggestedVideos.map((tutorial) => (
                                <div key={tutorial.id} className="bg-white shadow-sm rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowVideo(tutorial.videos?.[0] || null)}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-800">{tutorial.title[langKey] || tutorial.title.en}</h4>
                                            <p className="text-xs text-gray-500">{tutorial.videos?.[0]?.title[langKey] || tutorial.videos?.[0]?.title.en || 'First video'}</p>
                                        </div>
                                        <div className="text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="flex justify-start items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">DP</div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-white shadow-sm">
                            <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            {/* Voice Input Section */}
            <div className={`mt-4 rounded-lg border p-4 transition-colors duration-300 ${
                isListening ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
            }`}>
                <div className="flex flex-col items-center space-y-3">
                    <div className="text-center">
                        <p className={`text-sm mb-2 font-medium ${
                            isListening ? 'text-red-700' : 'text-gray-600'
                        }`}>
                            {isListening ? t('listening') || 'सुन रहा हूं...' : t('askGuruQuestion') || 'गुरु जी से सवाल पूछें'}
                        </p>
                    </div>
                    
                    {/* Voice Button */}
                    <button
                        onClick={onListen}
                        disabled={isLoading || !onListen}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 ${
                            isListening 
                                ? 'bg-red-500 animate-pulse shadow-red-200' 
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <svg 
                            className="w-8 h-8 text-white" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                        </svg>
                    </button>
                    
                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            {t('tapToSpeak') || 'बोलने के लिए दबाएं'}
                        </p>
                    </div>
                    
                    {/* Debug info */}
                    {!onListen && (
                        <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                            Debug: Voice function not available
                        </div>
                    )}
                </div>
            </div>
            
            {/* Video Player Modal */}
            {showVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <VideoPlayer
                        videoUrl={showVideo.videoUrl}
                        title={showVideo.title[langKey] || showVideo.title.en}
                        duration={showVideo.videoDuration}
                        onClose={() => setShowVideo(null)}
                        t={t}
                    />
                </div>
            )}
        </div>
    );
};

export default GuruChatPage; 