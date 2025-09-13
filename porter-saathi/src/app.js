import React, { useState, useEffect } from 'react';

// Import components
import LanguageSelection from './components/LanguageSelection';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import LogoutPage from './components/LogoutPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import GuruPage from './components/pages/GuruPage';
import GuruChatPage from './components/pages/GuruChatPage';
import SurakshaPage from './components/pages/SurakshaPage';
import ProfilePage from './components/pages/ProfilePage';
import TutorialDetail from './components/TutorialDetail';
import EmpowermentPage from './components/pages/EmpowermentPage';


// Import hooks
import { useTranslation } from './hooks/useTranslation';
import { useAudio } from './hooks/useAudio';
import { useEarnings } from './hooks/useEarnings';

// Import data
import { MOCK_DATA } from './data/mockData';
import apiService from './utils/apiService';

// --- Main App Component ---
export default function App() {
    const [language, setLanguage] = useState(() => {
        // Try to get saved language from localStorage
        return localStorage.getItem('selectedLanguage') || null;
    }); // e.g., 'hi-IN', 'en-IN'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [page, setPage] = useState('home');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);

    // Use custom hooks
    const { t } = useTranslation(language);
    const { generateAndPlayAudio, stopAudio, audioPlayer } = useAudio(language);
    const { earnings, loading: earningsLoading } = useEarnings();
    
    // State for weekly earnings data (for screen reading)
    const [weeklyEarnings, setWeeklyEarnings] = useState(null);

    // Check for existing authentication on app load
    useEffect(() => {
        const checkAuth = () => {
            if (apiService.isAuthenticated()) {
                const userData = apiService.getUserData();
                if (userData) {
                    setIsLoggedIn(true);
                    setCurrentUser(userData);
                }
            }
        };
        checkAuth();
    }, []);

    // Debug log for development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && currentUser) {
            console.log('Current user:', currentUser.name || 'User');
        }
    }, [currentUser]);

    // Initialize Speech Recognition API
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Fetch weekly earnings data for screen reading
    const fetchWeeklyEarnings = async () => {
        try {
            if (apiService.isAuthenticated()) {
                const weeklyData = await apiService.getWeeklyEarnings();
                setWeeklyEarnings(weeklyData);
                console.log('📊 Weekly earnings data loaded for AI:', weeklyData);
            }
        } catch (error) {
            console.error('Failed to fetch weekly earnings for AI:', error);
        }
    };
    
    // Fetch weekly data when user is authenticated
    useEffect(() => {
        if (isLoggedIn && apiService.isAuthenticated()) {
            fetchWeeklyEarnings();
        }
    }, [isLoggedIn]);
    
    // Create comprehensive screen data for AI
    const getScreenData = () => {
        const todayNet = (earnings?.today?.revenue || 0) - (earnings?.today?.expenses || 0);
        const lastWeekNet = (earnings?.lastWeek?.revenue || 0) - (earnings?.lastWeek?.expenses || 0);
        const currentWeekNet = weeklyEarnings?.currentWeek?.netEarnings || 0;
        const weeklyTotal = currentWeekNet;
        const dailyAverage = Math.round(currentWeekNet / 7);
        const growthPercentage = weeklyEarnings?.growthPercentage || 0;
        
        return {
            // Today's earnings (from HomePage)
            today: {
                netEarnings: todayNet,
                revenue: earnings?.today?.revenue || 0,
                expenses: earnings?.today?.expenses || 0,
                trips: earnings?.today?.trips || 0
            },
            // Last week summary
            lastWeek: {
                netEarnings: lastWeekNet,
                revenue: earnings?.lastWeek?.revenue || 0,
                expenses: earnings?.lastWeek?.expenses || 0,
                trips: earnings?.lastWeek?.trips || 0
            },
            // Current week (from WeeklyProgress)
            currentWeek: {
                weeklyTotal: weeklyTotal,
                dailyAverage: dailyAverage,
                growthPercentage: growthPercentage,
                dailyBreakdown: weeklyEarnings?.weeklyData || []
            }
        };
    };

    // --- Core AI Text Response Function ---
    const getAIResponse = async (userQuery, currentChatHistory) => {
        setIsLoading(true);
        setAiResponse('');
        
        // Get comprehensive screen data for AI
        const screenData = getScreenData();
        
        // Debug: Log screen data availability
        console.log('🤖 AI Response - Screen data:', {
            hasEarnings: !!earnings,
            hasWeeklyData: !!weeklyEarnings,
            todayNet: screenData.today.netEarnings,
            weeklyTotal: screenData.currentWeek.weeklyTotal,
            dailyAverage: screenData.currentWeek.dailyAverage,
            growthPercentage: screenData.currentWeek.growthPercentage
        });

        if (page === 'guru-chat') {
            setChatHistory(prev => [...prev, { sender: 'user', text: userQuery }]);
        }

        // If user is authenticated, try to use backend chat API
        if (apiService.isAuthenticated() && (page === 'guru-chat' || page === 'home')) {
            try {
                const sessionType = page === 'guru-chat' ? 'guru' : 'general';
                const response = await apiService.sendChatMessage(userQuery, null, sessionType, language);
                
                const responseText = response.response;
                if (page === 'guru-chat') {
                    setChatHistory(prev => [...prev, { sender: 'ai', text: responseText }]);
                } else {
                    setAiResponse(responseText);
                }
                await generateAndPlayAudio(responseText);
                setIsLoading(false);
                return;
            } catch (error) {
                console.warn('Backend chat failed, falling back to direct AI:', error);
                // Continue with direct AI call as fallback
            }
        }

        // Check if user is asking about specific tutorials and auto-navigate
        const queryLower = userQuery.toLowerCase();
        const shouldAutoNavigate = page !== 'guru-chat'; // Only auto-navigate from home page, not in guru-chat
        
        // Check for emergency keywords first (highest priority)
        const emergencyKeywords = ['emergency', 'help', 'accident', 'urgent', 'danger', 'hurt', 'injured', 'medical', 'इमरजेंसी', 'मदद', 'एक्सीडेंट', 'चोट', 'అత్యవసరం', 'సహాయం', 'ప్రమాదం', 'గాయం', 'அவசரம்', 'உதவி', 'விபத்து', 'காயம்'];
        
        // Check for specific emergency service requests
        const ambulanceKeywords = ['ambulance', 'एम्बुलेंस', 'అంబులెన్స్', 'ஆம்புலன்ஸ்'];
        const policeKeywords = ['police', 'पुलिस', 'పోలీస్', 'காவல்துறை'];
        const fireKeywords = ['fire', 'fire brigade', 'आग', 'फायर', 'फायर ब्रिगेड', 'అగ్ని', 'ఫైర్', 'ఫైర్ బ్రిగేడ్', 'தீ', 'தீயணைப்பு'];
        
        // Check if asking for specific emergency numbers
        const isAskingAmbulance = ambulanceKeywords.some(keyword => queryLower.includes(keyword)) && (queryLower.includes('number') || queryLower.includes('नंबर') || queryLower.includes('నంబర్') || queryLower.includes('எண்'));
        const isAskingPolice = policeKeywords.some(keyword => queryLower.includes(keyword)) && (queryLower.includes('number') || queryLower.includes('नंबर') || queryLower.includes('నంబర్') || queryLower.includes('எண்'));
        const isAskingFire = fireKeywords.some(keyword => queryLower.includes(keyword)) && (queryLower.includes('number') || queryLower.includes('नंबर') || queryLower.includes('నంబర్') || queryLower.includes('எண்'));
        
        // Handle specific emergency number requests
        if (isAskingAmbulance) {
            const ambulanceResponse = t('ambulanceNumber');
            setAiResponse(ambulanceResponse);
            await generateAndPlayAudio(ambulanceResponse);
            setIsLoading(false);
            return;
        }
        
        if (isAskingPolice) {
            const policeResponse = t('policeNumber');
            setAiResponse(policeResponse);
            await generateAndPlayAudio(policeResponse);
            setIsLoading(false);
            return;
        }
        
        if (isAskingFire) {
            const fireResponse = t('fireNumber');
            setAiResponse(fireResponse);
            await generateAndPlayAudio(fireResponse);
            setIsLoading(false);
            return;
        }
        
        // Check for earnings-related queries first (before emergency detection)
        const earningsKeywords = [
            'earning', 'कमाई', 'income', 'आय', 'money', 'पैसा', 'revenue', 'profit', 'नफा', 
            'today', 'आज', 'week', 'सप्ताह', 'trips', 'यात्रा', 'expenses', 'खर्च', 
            'weekly', 'daily', 'average', 'growth', 'progress', 'total', 'कुल',
            'salary', 'वेतन', 'payment', 'भुगतान', 'cash', 'नकद', 'balance', 'बैलेंस',
            'amount', 'राशि', 'rupees', 'रुपये', 'paisa', 'पैसे', 'kitna', 'कितना',
            'show', 'दिखाओ', 'tell', 'बताओ', 'batao', 'dikhao'
        ];
        const isEarningsQuery = earningsKeywords.some(keyword => queryLower.includes(keyword));
        
        if (isEarningsQuery && (earnings || weeklyEarnings)) {
            // Debug: Log screen data for earnings query
            console.log('🎤 Earnings Query - Screen Data:', screenData);
            
            // Check if it's a simple "how much" query for quick response
            const simpleQueries = ['kitna', 'कितना', 'कितनी', 'how much', 'batao', 'बताओ', 'dikhao', 'दिखाओ'];
            const isSimpleQuery = simpleQueries.some(keyword => queryLower.includes(keyword));
            
            let earningsResponse = '';
            
            if (isSimpleQuery) {
                // Provide quick, focused response
                if (language === 'hi-IN') {
                    earningsResponse = `आज की कमाई ₹${screenData.today.netEarnings} है। इस सप्ताह की कुल कमाई ₹${screenData.currentWeek.weeklyTotal} है।`;
                } else {
                    earningsResponse = `Today's earnings are ₹${screenData.today.netEarnings}. This week's total is ₹${screenData.currentWeek.weeklyTotal}.`;
                }
            } else {
                // Provide comprehensive earnings information
                if (language === 'hi-IN') {
                    earningsResponse = `आपकी कमाई की जानकारी:

आज की कमाई ₹${screenData.today.netEarnings} है। आपका राजस्व ₹${screenData.today.revenue} है, खर्च ₹${screenData.today.expenses} है, और आपने ${screenData.today.trips} यात्राएं की हैं।

इस सप्ताह की कुल कमाई ₹${screenData.currentWeek.weeklyTotal} है। दैनिक औसत ₹${screenData.currentWeek.dailyAverage} है। पिछले सप्ताह की तुलना में ${screenData.currentWeek.growthPercentage >= 0 ? 'वृद्धि' : 'कमी'} ${Math.abs(screenData.currentWeek.growthPercentage).toFixed(1)} प्रतिशत है।

पिछले सप्ताह की कुल कमाई ₹${screenData.lastWeek.netEarnings} थी।`;
                } else {
                    earningsResponse = `Your earnings information:

Today's earnings are ₹${screenData.today.netEarnings}. Your revenue is ₹${screenData.today.revenue}, expenses are ₹${screenData.today.expenses}, and you completed ${screenData.today.trips} trips.

This week's total earnings are ₹${screenData.currentWeek.weeklyTotal}. Daily average is ₹${screenData.currentWeek.dailyAverage}. Compared to last week, there's a ${screenData.currentWeek.growthPercentage >= 0 ? 'growth' : 'decrease'} of ${Math.abs(screenData.currentWeek.growthPercentage).toFixed(1)} percent.

Last week's total earnings were ₹${screenData.lastWeek.netEarnings}.`;
                }
            }
            
            console.log('🎤 Generated earnings response:', earningsResponse);
            
            if (page === 'guru-chat') {
                setChatHistory(prev => [...prev, { sender: 'user', text: userQuery }, { sender: 'ai', text: earningsResponse }]);
            } else {
                setAiResponse(earningsResponse);
            }
            await generateAndPlayAudio(earningsResponse);
            setIsLoading(false);
            return;
        }
        
        // General emergency detection (for situations, not specific number requests)
        const isEmergency = emergencyKeywords.some(keyword => queryLower.includes(keyword));
        
        if (isEmergency) {
            // Navigate to Suraksha page and provide calming response
            setPage('suraksha');
            const emergencyResponse = `${t('stayCalm')} ${t('emergencyDetected')}`;
            setAiResponse(emergencyResponse);
            await generateAndPlayAudio(emergencyResponse);
            setIsLoading(false);
            return;
        }
        
        if (shouldAutoNavigate) {
            // Check for empowerment-related queries (government schemes, rights, legal help)
            const empowermentKeywords = ['scheme', 'loan', 'subsidy', 'government', 'upgrade', 'truck', 'vehicle', 'rights', 'legal', 'fine', 'police', 'payment', 'dispute', 'योजना', 'लोन', 'सब्सिडी', 'सरकार', 'अपग्रेड', 'ट्रक', 'वाहन', 'अधिकार', 'कानूनी', 'फाइन', 'पुलिस', 'भुगतान', 'विवाद', 'పథకం', 'లోన్', 'సబ్సిడీ', 'ప్రభుత్వం', 'అప్‌గ్రేడ్', 'ట్రక్', 'వాహనం', 'హక్కులు', 'చట్టపరమైన', 'ఫైన్', 'పోలీస్', 'చెల్లింపు', 'వివాదం', 'திட்டம்', 'கடன்', 'மானியம்', 'அரசு', 'மேம்படுத்தல்', 'டிரக்', 'வாகனம்', 'உரிமைகள்', 'சட்ட', 'அபராதம்', 'போலீஸ்', 'பணம்', 'சர்ச்சை'];
            const isEmpowermentQuery = empowermentKeywords.some(keyword => queryLower.includes(keyword));
            
            if (isEmpowermentQuery) {
                setPage('empowerment');
                const empowermentResponse = `${t('switchedToEmpowerment') || 'Let me help you with government schemes and your rights'}`;
                setAiResponse(empowermentResponse);
                await generateAndPlayAudio(empowermentResponse);
                setIsLoading(false);
                return;
            }
            else if (queryLower.includes('challan') || queryLower.includes('traffic') || queryLower.includes('fine') || queryLower.includes('penalty')) {
                const challanTutorial = MOCK_DATA.tutorials.find(t => t.category === 'challan');
                if (challanTutorial) {
                    setPage('guru');
                    setTimeout(() => {
                        setSelectedTutorial(challanTutorial);
                    }, 100);
                    setIsLoading(false);
                    return;
                }
            }
            // Check for insurance-related queries
            else if (queryLower.includes('insurance') || queryLower.includes('claim') || queryLower.includes('accident') || queryLower.includes('damage')) {
                const insuranceTutorial = MOCK_DATA.tutorials.find(t => t.category === 'insurance');
                if (insuranceTutorial) {
                    setPage('guru');
                    setTimeout(() => {
                        setSelectedTutorial(insuranceTutorial);
                    }, 100);
                    setIsLoading(false);
                    return;
                }
            }
            // Check for digilocker-related queries
            else if (queryLower.includes('digilocker') || queryLower.includes('document') || queryLower.includes('papers') || queryLower.includes('license')) {
                const digilockerTutorial = MOCK_DATA.tutorials.find(t => t.category === 'digilocker');
                if (digilockerTutorial) {
                    setPage('guru');
                    setTimeout(() => {
                        setSelectedTutorial(digilockerTutorial);
                    }, 100);
                    setIsLoading(false);
                    return;
                }
            }
            // Check for customer service-related queries
            else if (queryLower.includes('customer') || queryLower.includes('talk') || queryLower.includes('behavior') || queryLower.includes('service')) {
                const customerTutorial = MOCK_DATA.tutorials.find(t => t.category === 'customer');
                if (customerTutorial) {
                    setPage('guru');
                    setTimeout(() => {
                        setSelectedTutorial(customerTutorial);
                    }, 100);
                    setIsLoading(false);
                    return;
                }
            }
        }

        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Switch persona based on the current page
        const isGuruChat = page === 'guru-chat';
        const systemPrompt = isGuruChat
            ? `You are "Porter Guru," an interactive problem-solving AI expert for drivers. Your goal is to diagnose any problem the driver is facing—whether it's with their vehicle, the Porter Saathi app itself, or understanding their earnings—through a calm, diagnostic conversation.
               
               **EMERGENCY PRIORITY:** If the user mentions emergency, accident, help, ambulance, police, fire, danger, hurt, injured, or medical situations, immediately respond with calming words and tell them you are redirecting them to emergency services. Say: "Please stay calm. I am redirecting you to emergency services immediately. Take deep breaths."
               
               **CRITICAL RULE:** Do NOT provide a solution immediately. First, ask simple, clarifying questions one by one to understand the issue fully. Engage in a back-and-forth dialogue.
               
               **Example (App Problem):**
               - Driver: "I don't know how to use the app."
               - You: "I can definitely help you with that. What are you trying to do right now? Are you trying to check your earnings, find a tutorial, or something else?"

               **Core Directives:**
               1.  **Emergency First:** Detect and respond to emergency situations with calming language.
               2.  **Diagnose First:** Always ask questions before giving answers.
               3.  **Language Discipline:** Respond ONLY in the language of this code: ${language}.
               4.  **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".
               5.  **Use Chat History:** Consider the previous messages in this conversation: ${JSON.stringify(currentChatHistory)}.`
            : `You are "Porter Saathi," an expert AI customer support agent for truck drivers in India. Your only goal is to provide clear, precise, and helpful answers.
               
               **EMERGENCY NUMBERS:** If asked for emergency numbers, provide these official Indian emergency numbers:
               - Ambulance: 108 (National Emergency Number)
               - Police: 100 (Police Emergency)
               - Fire Brigade: 101 (Fire Emergency)
               
               **Core Directives:**
               1.  **Emergency Priority:** Always provide emergency numbers when asked directly.
               2.  **Screen Data:** Use this EXACT data currently displayed on user's screen: ${JSON.stringify(screenData)}. This includes today's earnings (₹${screenData.today.netEarnings}), weekly progress (₹${screenData.currentWeek.weeklyTotal} total, ₹${screenData.currentWeek.dailyAverage} daily average, ${screenData.currentWeek.growthPercentage.toFixed(1)}% growth), and last week (₹${screenData.lastWeek.netEarnings}).
               3.  **Precision is Key:** Do NOT give vague answers. If you don't know, say so.
               4.  **Language Discipline:** Respond ONLY in the language of this code: ${language}.
               5.  **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".
               6.  **Be Action-Oriented:** Suggest clear next steps (e.g., go to Guru section).`;

        const payload = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userQuery }] }],
            generationConfig: { responseMimeType: "application/json" }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
                const parsedResponse = JSON.parse(rawText);
                const responseText = parsedResponse.response_text;
                if (isGuruChat) {
                    setChatHistory(prev => [...prev, { sender: 'ai', text: responseText }]);
                } else {
                    setAiResponse(responseText);
                }
                await generateAndPlayAudio(responseText);
            } else { throw new Error("No content in AI response."); }
        } catch (error) {
            console.error("AI API call failed:", error);
            const errorText = t('networkError');
            if (isGuruChat) {
                setChatHistory(prev => [...prev, { sender: 'ai', text: errorText }]);
            } else {
                setAiResponse(errorText);
            }
            await generateAndPlayAudio(errorText);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Main microphone toggle function ---
    const toggleListen = () => {
        if (!recognition) {
            setAiResponse(t('voiceSupportError'));
            return;
        }

        const recognizer = new recognition();
        recognizer.lang = language;
        recognizer.interimResults = false;

        if (isListening) {
            recognizer.stop();
            setIsListening(false);
        } else {
            audioPlayer.pause();
            setIsListening(true);
            if (page !== 'guru-chat') {
                setAiResponse(t('listening'));
            }
            recognizer.start();

            recognizer.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                getAIResponse(transcript, chatHistory);
            };
            recognizer.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setAiResponse(t('micError'));
            };
            recognizer.onend = () => setIsListening(false);
        }
    };

    // --- Language Selection Handler ---
    const handleLanguageSelection = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        localStorage.setItem('selectedLanguage', selectedLanguage);
    };

    // --- Initial Language Selection ---
    if (!language) {
        return <LanguageSelection onSelectLanguage={handleLanguageSelection} />;
    }

    // --- Logout Page ---
    if (showLogout && isLoggedIn) {
        return (
            <LogoutPage 
                language={language} 
                onConfirmLogout={() => {
                    apiService.clearAuth();
                    setIsLoggedIn(false);
                    setCurrentUser(null);
                    setShowLogout(false);
                    setShowSignup(false);
                    setPage('home');
                    setChatHistory([]);
                    setSelectedTutorial(null);
                    setAiResponse('');
                }}
                onCancelLogout={() => setShowLogout(false)}
                t={t} 
                speak={generateAndPlayAudio} 
                stopVoice={stopAudio} 
            />
        );
    }

    // --- Signup Page ---
    if (showSignup && !isLoggedIn) {
        return (
            <SignupPage 
                language={language} 
                onSignupComplete={(data) => {
                    console.log('Signup completed:', data);
                    
                    // The signup now returns real backend data with token
                    if (data.user && data.token) {
                        setIsLoggedIn(true);
                        setCurrentUser(data.user);
                        // Token is already stored by apiService.signup()
                        console.log('✅ User authenticated after signup:', data.user.name);
                    } else {
                        console.error('❌ Invalid signup response:', data);
                    }
                    
                    setShowSignup(false);
                }} 
                onBackToLogin={() => setShowSignup(false)}
                t={t} 
                speak={generateAndPlayAudio} 
                stopVoice={stopAudio} 
            />
        );
    }

    // --- Login Page ---
    if (!isLoggedIn) {
        return (
            <LoginPage 
                language={language} 
                onLogin={(loggedIn, userData) => {
                    setIsLoggedIn(loggedIn);
                    if (userData) {
                        setCurrentUser(userData);
                    }
                }} 
                onGoToSignup={() => setShowSignup(true)}
                t={t} 
                speak={generateAndPlayAudio} 
                stopVoice={stopAudio} 
            />
        );
    }

    // --- Guru Chat Initialization ---
    const startGuruChat = () => {
        setChatHistory([]);
        setPage('guru-chat');
        const intro = t('guruChatIntro');
        setTimeout(() => {
            setChatHistory([{ sender: 'ai', text: intro }]);
            generateAndPlayAudio(intro);
        }, 200);
    }



    // --- Main Page Router ---
    const renderPage = () => {
        if (selectedTutorial) {
            return <TutorialDetail tutorial={selectedTutorial} onBack={() => setSelectedTutorial(null)} speak={generateAndPlayAudio} t={t} language={language} />;
        }
        switch (page) {
            case 'guru-chat': return <GuruChatPage chatHistory={chatHistory} isLoading={isLoading} t={t} onBack={() => setPage('guru')} language={language} onEmergency={() => setPage('suraksha')} speak={generateAndPlayAudio} onListen={toggleListen} isListening={isListening} />;
            case 'guru': return <GuruPage onSelectTutorial={setSelectedTutorial} onStartChat={startGuruChat} t={t} language={language} />;
            case 'suraksha': return <SurakshaPage speak={generateAndPlayAudio} t={t} language={language} audioPlayer={audioPlayer} recognition={recognition} />;
            case 'empowerment': return <EmpowermentPage language={language} t={t} speak={generateAndPlayAudio} />;
            case 'profile': return <ProfilePage t={t} language={language} onBack={() => setPage('home')} />;
            case 'home': default: return <HomePage aiResponse={aiResponse} isLoading={isLoading} t={t} language={language} onListen={toggleListen} isListening={isListening} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto max-w-lg h-screen flex flex-col p-4 bg-white shadow-lg">
                <Header t={t} onLogout={() => setShowLogout(true)} onProfile={() => setPage('profile')} currentUser={currentUser} />
                <main className="flex-grow overflow-y-auto pb-24">{renderPage()}</main>
                <Footer currentPage={page} setPage={setPage} onListen={toggleListen} isListening={isListening} t={t} />
            </div>
        </div>
    );
}

// Note: The remaining components (GuruPage, GuruChatPage, TutorialDetail, SurakshaPage) 
// would also be extracted to separate files in a complete refactoring 
