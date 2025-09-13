import React, { useState, useRef } from 'react';

// Import components
import LanguageSelection from './components/LanguageSelection';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';

// Import hooks
import { useTranslation } from './hooks/useTranslation';
import { useAudio } from './hooks/useAudio';

// Import data
import { MOCK_DATA } from './data/mockData';


// --- Multi-language Translations Object ---
const translations = {
    appName: { en: 'Porter Saathi', hi: 'पोर्टर साथी', te: 'పోర్టర్ సాథి', ta: 'போர்ட்டர் சாத்தி' },
    greeting: { en: 'Driver Partner!', hi: 'ड्राइवर पार्टनर!', te: 'డ్రైవర్ పార్టనర్!', ta: 'டிரைவர் பார்ட்னர்!' },
    home: { en: 'Home', hi: 'होम', te: 'హోమ్', ta: 'முகப்பு' },
    guru: { en: 'Guru', hi: 'गुरु', te: 'గురు', ta: 'குரு' },
    suraksha: { en: 'Suraksha', hi: 'सुरक्षा', te: 'సురక్ష', ta: 'சுரக்ஷா' },
    todaysEarnings: { en: "Today's Earnings", hi: 'आज की कमाई', te: 'ఈ రోజు సంపాదన', ta: 'இன்றைய வருமானம்' },
    totalRevenue: { en: 'Total Revenue', hi: 'कुल कमाई', te: 'మొత్తం రాబడి', ta: 'மொத்த வருவாய்' },
    expenses: { en: 'Expenses', hi: 'ఖర్చులు', te: 'ఖర్చులు', ta: 'செலவுகள்' },
    trips: { en: 'Trips', hi: 'ट्रिप्स', te: 'ట్రిప్పులు', ta: 'பயணங்கள்' },
    askAnything: { en: 'You can ask anything.', hi: 'आप कुछ भी पूछ सकते हैं।', te: 'మీరు ఏదైనా అడగవచ్చు.', ta: 'நீங்கள் எதுவும் கேட்கலாம்.' },
    listening: { en: 'Listening...', hi: 'सुन रहा हूँ...', te: 'వింటున్నాను...', ta: 'கேட்கிறேன்...' },
    thinking: { en: 'Thinking...', hi: 'सोच रहा हूँ...', te: 'ఆలోచిస్తున్నాను...', ta: 'யோசிக்கிறேன்...' },
    micError: { en: 'There is a problem with the mic. Please try again.', hi: 'माइक में कुछ गड़बड़ है। कृपया दोबारा कोशिश करें।', te: 'మైక్‌లో సమస్య ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.', ta: 'மைக்கில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும்.' },
    networkError: { en: 'Sorry, there is a network issue. Please try again later.', hi: 'माफ कीजिये, अभी नेटवर्क में समस्या है। कृपया थोड़ी देर बाद कोशिश करें।', te: 'క్షమించండి, నెట్‌వర్క్ సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.', ta: 'மன்னிக்கவும், நெட்வொர்க் சிக்கல் உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.' },
    voiceSupportError: { en: 'Voice recognition is not supported in your browser.', hi: 'आपके ब्राउज़र में वॉइस रिकग्निशन सपोर्ट नहीं है।', te: 'మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు.', ta: 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை.' },
    clickMicAndSpeak: { en: 'Click on the mic and speak:', hi: 'माइक पे क्लिक करके बोलें:', te: 'మైక్‌పై క్లిక్ చేసి మాట్లాడండి:', ta: 'மைக்கைக் கிளிக் செய்து பேசவும்:' },
    exampleQuestion: {
        en: '"How much did I earn today?"',
        hi: '"आज मैंने कितना कमाया?"',
        te: '"ఈ రోజు నేను ఎంత సంపాదించాను?"',
        ta: '"இன்று நான் எவ்வளவு சம்பாதித்தேன்?"'
    },
    penaltyReward: { en: 'Penalty / Reward', hi: 'पेनल्टी / रिवॉर्ड', te: 'పెనాల్టీ / రివార్డ్', ta: 'தண்டனை / வெகுமதி' },
    penaltyText: { en: 'Penalty: ₹50. Late delivery (30 min). Please deliver on time.', hi: 'पेनल्टी: ₹50। देर से डिलीवरी (30 मिनट)। कृपया समय पर डिलीवरी करें।', te: 'పెనాల్టీ: ₹50. ఆలస్యంగా డెలివరీ (30 నిమి). దయచేసి సమయానికి డెలివరీ చేయండి.', ta: 'தண்டனை: ₹50. தாமதமாக டெலிவரி (30 நிமி). சரியான நேரத்தில் டெலிவரி செய்யவும்.' },
    guruTitle: { en: 'Guru - For Learning', hi: 'गुरु - सीखने के लिए', te: 'గురు - నేర్చుకోవడానికి', ta: 'குரு - கற்றுக்கொள்ள' },
    goBack: { en: 'Go Back', hi: 'वापस जायें', te: 'వెనుకకు వెళ్ళు', ta: 'பின்செல்' },
    surakshaTitle: { en: 'Suraksha Shield', hi: 'सुरक्षा शील्ड', te: 'సురక్షా షీల్డ్', ta: 'சுரக்ஷா ஷீல்ட்' },
    help: { en: 'HELP', hi: 'सहायता', te: 'సహాయం', ta: 'உதவி' },
    emergencyConfirm: { en: 'Do you need emergency assistance? Please say yes or no.', hi: 'क्या आपको इमरजेंसी सहायता चाहिए? कृपया हाँ या ना बोलें।', te: 'మీకు అత్యవసర సహాయం కావాలా? దయచేసి అవును లేదా కాదు అని చెప్పండి.', ta: 'உங்களுக்கு அவசர உதவி தேவையா? ஆம் அல்லது இல்லை என்று சொல்லவும்.' },
    requestSent: { en: 'Your location has been sent. Porter support will contact you soon. Stay calm.', hi: 'आपकी लोकेशन भेज दी गयी है। पोर्टर सपोर्ट जल्द ही आपसे कांटेक्ट करेगा। शांत रहें।', te: 'మీ లొకేషన్ పంపబడింది. పోర్టర్ సపోర్ట్ మిమ్మల్ని త్వరలో సంప్రదిస్తుంది. ప్రశాంతంగా ఉండండి.', ta: 'உங்கள் இருப்பிடம் அனுப்பப்பட்டது. போர்ட்டர் ஆதரவு உங்களைத் விரைவில் தொடர்பு கொள்ளும். அமைதியாக இருங்கள்.' },
    requestCancelled: { en: 'Emergency request has been cancelled.', hi: 'इमरजेंसी रिक्वेस्ट कैंसिल कर दी गयी है।', te: 'అత్యవసర అభ్యర్థన రద్దు చేయబడింది.', ta: 'அவசர கோரிக்கை ரத்து செய்யப்பட்டது.' },
    safetyAlert: { en: 'The road ahead is bad, please drive carefully.', hi: 'आगे सड़क खराब है, कृपया ध्यान से चलायें।', te: 'ముందున్న రహదారి బాగాలేదు, దయచేసి జాగ్రత్తగా నడపండి.', ta: 'முன்னால் சாலை சரியில்லை, கவனமாக ஓட்டவும்.' },
    emergencyQuery: { en: 'Emergency?', hi: 'इमरजेंसी?', te: 'అత్యవసరమా?', ta: 'அவசரమా?' },
    emergencyHelpQuery: { en: 'Listening for your confirmation... Say "Yes" or "No".', hi: 'आपकी पुष्टि के लिए सुन रहे हैं... "हाँ" या "ना" बोलें।', te: 'మీ నిర్ధారణ కోసం వింటున్నాను... "అవును" లేదా "కాదు" అని చెప్పండి.', ta: 'உங்கள் உறுதிப்படுத்தலுக்காகக் கேட்கிறது... "ஆம்" அல்லது "இல்லை" என்று சொல்லுங்கள்.' },
    cancel: { en: 'Cancel', hi: 'कैंसिल', te: 'రద్దు చేయి', ta: 'ரத்து செய்' },
    yes: { en: 'Yes', hi: 'हाँ', te: 'అవును', ta: 'ஆம்' },
    requestSentTitle: { en: 'Request Sent', hi: 'रिक्वेस्ट भेज दी गयी है', te: 'అభ్యర్థన పంపబడింది', ta: 'கோரிக்கை அனுப்பப்பட்டது' },
    helpOnWay: { en: 'Help is on the way. Keep your phone with you.', hi: 'मदद जल्द ही आ रही है। फ़ोन अपने पास रखें।', te: 'సహాయం వస్తోంది. మీ ఫోన్‌ను మీ వద్ద ఉంచుకోండి.', ta: 'உதவி வருகிறது. உங்கள் தொலைபேசியை உங்களுடன் வைத்திருங்கள்.' },
    safetyAlerts: { en: 'Safety Alerts', hi: 'सेफ्टी अलर्ट', te: 'భద్రతా హెచ్చరికలు', ta: 'பாதுகாப்பு எச்சரிக்கைகள்' },
    playRoadAlert: { en: 'Play Road Alert', hi: 'रोड अलर्ट सुनायें', te: 'రోడ్ అలర్ట్ ప్లే చేయండి', ta: 'சாலை எச்சரிக்கையை இயக்கவும்' },
    chooseLanguage: { en: 'Choose Your Language', hi: 'अपनी भाषा चुनें', te: 'మీ భాషను ఎంచుకోండి', ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்' },
    // Login page translations
    loginTitle: { en: 'Login to Porter Saathi', hi: 'पोर्टर साथी में लॉगिन करें', te: 'పోర్టర్ సాథిలో లాగిన్ చేయండి', ta: 'போர்ட்டர் சாத்தியில் உள்நுழையவும்' },
    mobileNumber: { en: 'Mobile Number', hi: 'मोबाइल नंबर', te: 'మొబైల్ నంబర్', ta: 'மொபைல் எண்' },
    enterMobile: { en: 'Enter your mobile number', hi: 'अपना मोबाइल नंबर डालें', te: 'మీ మొబైల్ నంబర్ నమోదు చేయండి', ta: 'உங்கள் மொபைல் எண்ணை உள்ளிடவும்' },
    sendOTP: { en: 'Send OTP', hi: 'OTP भेजें', te: 'OTP పంపండి', ta: 'OTP அனுப்பவும்' },
    enterOTP: { en: 'Enter OTP', hi: 'OTP डालें', te: 'OTP నమోదు చేయండి', ta: 'OTP ஐ உள்ளிடவும்' },
    otpSent: { en: 'OTP sent to your mobile number', hi: 'आपके मोबाइल नंबर पर OTP भेजा गया', te: 'మీ మొబైల్ నంబర్‌కు OTP పంపబడింది', ta: 'உங்கள் மொபைல் எண்ணுக்கு OTP அனுப்பப்பட்டது' },
    verifyLogin: { en: 'Verify & Login', hi: 'सत्यापित करें और लॉगिन करें', te: 'ధృవీకరించి లాగిన్ చేయండి', ta: 'சரிபார்த்து உள்நுழையவும்' },
    resendOTP: { en: 'Resend OTP', hi: 'OTP दोबारा भेजें', te: 'OTP మళ్లీ పంపండి', ta: 'OTP ஐ மீண்டும் அனுப்பவும்' },
    invalidMobile: { en: 'Please enter a valid 10-digit mobile number', hi: 'कृपया 10 अंकों का वैध मोबाइल नंबर डालें', te: 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి', ta: 'தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்' },
    invalidOTP: { en: 'Please enter a valid 6-digit OTP', hi: 'कृपया 6 अंकों का वैध OTP डालें', te: 'దయచేసి చెల్లుబాటు అయ్యే 6 అంకెల OTP నమోదు చేయండి', ta: 'தயவுசெய்து சரியான 6 இலக்க OTP ஐ உள்ளிடவும்' },
    changeMobile: { en: 'Change Mobile Number', hi: 'मोबाइल नंबर बदलें', te: 'మొబైల్ నంబర్ మార్చండి', ta: 'மொபைல் எண்ணை மாற்றவும்' },
    locationAlerts: { en: 'Location Based Alerts', hi: 'लोकेशन आधारित अलर्ट', te: 'స్థాన ఆధారిత హెచ్చరికలు', ta: 'இடத்தின் அடிப்படையிலான எச்சரிக்கைகள்' },
    checkLocation: { en: 'Check Road Ahead', hi: 'आगे का रास्ता जांचें', te: 'ముందున్న రహదారిని తనిఖీ చేయండి', ta: 'சாலை சரிபார்க்கவும்' },
    gettingLocation: { en: 'Getting your location...', hi: 'आपकी लोकेशन पता कर रहे हैं...', te: 'మీ స్థానాన్ని పొందుతున్నాము...', ta: 'உங்கள் இருப்பிடத்தைப் பெறுகிறது...' },
    locationError: { en: 'Could not get location. Please enable GPS.', hi: 'लोकेशन नहीं मिली। कृपया GPS চালু करें।', te: 'స్థానం పొందలేకపోయాము. దయచేసి GPSని ప్రారంభించండి.', ta: 'இருப்பிடத்தைப் பெற முடியவில்லை. GPS ஐ இயக்கவும்.' },
    locationPermissionDenied: { en: 'You have denied location permission. Please enable it in your browser settings.', hi: 'आपने लोकेशन की अनुमति नहीं दी है। कृपया ब्राउज़र सेटिंग्स में जाकर इसे चालू करें।', te: 'మీరు లొకేషన్ అనుమతిని నిరాకరించారు. దయచేసి మీ బ్రౌజర్ సెట్టింగ్‌లలో దాన్ని ప్రారంభించండి.', ta: 'நீங்கள் இருப்பிட அனுமதியை மறுத்துவிட்டீர்கள். உங்கள் உலாவி அமைப்புகளில் அதை இயக்கவும்.' },
    locationUnavailable: { en: 'Your location is currently unavailable.', hi: 'आपकी लोकेशन अभी पता नहीं चल पा रही है।', te: 'మీ స్థానం ప్రస్తుతం అందుబాటులో లేదు.', ta: 'உங்கள் இருப்பிடம் தற்போது கிடைக்கவில்லை.' },
    locationTimeout: { en: 'Getting location took too long. Please try again.', hi: 'लोकेशन पता करने में समय लग रहा है। कृपया दोबारा कोशिश करें।', te: 'స్థానం పొందడానికి చాలా సమయం పట్టింది. దయచేసి మళ్లీ ప్రయత్నించండి.', ta: 'இருப்பிடத்தைப் பெறுவதற்கு அதிக நேரம் எடுத்தது. மீண்டும் முயற்சிக்கவும்.' },
    schoolZoneAlert: { en: 'School zone ahead. Please drive slowly.', hi: 'आगे स्कूल जोन है। कृपया धीरे चलाएं।', te: 'ముందు పాఠశాల జోన్ ఉంది. దయచేసి నెమ్మదిగా నడపండి.', ta: 'பள்ளி மண்டலம் உள்ளது. மெதுவாக ஓட்டவும்.' },
    forestZoneAlert: { en: 'You are entering a forest zone. Be aware of wildlife.', hi: 'आप वन क्षेत्र में प्रवेश कर रहे हैं। वन्यजीवों से सावधान रहें।', te: 'మీరు అటవీ ప్రాంతంలోకి ప్రవేశిస్తున్నారు. వన్యప్రాణుల పట్ల జాగ్రత్తగా ఉండండి.', ta: 'நீங்கள் வனப்பகுதிக்குள் நுழைகிறீர்கள். வனவிலங்குகள் குறித்து எச்சரிக்கையாக இருங்கள்.' },
    badRoadAlert: { en: 'Bad road reported ahead. Drive carefully.', hi: 'आगे खराब सड़क की सूचना है। ध्यान से चलाएं।', te: 'ముందున్న రహదారి బాగాలేదని నివేదిక. జాగ్రత్తగా నడపండి.', ta: 'மோசமான சாலை உள்ளது. கவனமாக ஓட்டவும்.' },
    goodRoadAhead: { en: 'The road ahead is clear. Happy driving!', hi: 'आगे का रास्ता साफ है। आपकी यात्रा मंगलमय हो!', te: 'ముందున్న రహదారి స్పష్టంగా ఉంది. సంతోషంగా నడపండి!', ta: 'சாலை தெளிவாக உள்ளது. மகிழ்ச்சியாக ஓட்டவும்!' },
    talkToGuru: { en: 'Talk About a Problem', hi: 'समस्या के बारे में बात करें', te: 'సమస్య గురించి మాట్లాడండి', ta: 'ஒரு சிக்கலைப் பற்றி பேசுங்கள்' },
    guruChatTitle: { en: 'Problem Solving Chat', hi: 'समस्या समाधान चैट', te: 'సమస్య పరిష్కార చాట్', ta: 'சிக்கல் தீர்க்கும் அரட்டை' },
    guruChatIntro: { en: 'Tell me your problem. I will ask questions to help.', hi: 'मुझे अपनी समस्या बताएं। मैं मदद करने के लिए सवाल पूछूंगा।', te: 'మీ సమస్యను చెప్పండి. నేను సహాయం చేయడానికి ప్రశ్నలు అడుగుతాను.', ta: 'உங்கள் சிக்கலைச் சொல்லுங்கள். நான் உதவ கேள்விகளைக் கேட்பேன்.' },
    you: { en: 'You', hi: 'आप', te: 'మీరు', ta: 'நீங்கள்' },
    saathi: { en: 'Saathi', hi: 'साथी', te: 'సాథి', ta: 'சாத்தி' },
};

// --- Helper function to remove characters for clearer speech ---
const cleanForSpeech = (text) => text ? text.replace(/[*#!]/g, '') : "";

// --- Main App Component ---
export default function App() {
    const [language, setLanguage] = useState(null); // e.g., 'hi-IN', 'en-IN'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [page, setPage] = useState('home');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [audioPlayer] = useState(new Audio());
    const [chatHistory, setChatHistory] = useState([]);


    // Translation helper function
    const t = useCallback((key) => {
        if (!language) return '';
        const langKey = language.split('-')[0];
        return translations[key]?.[langKey] || translations[key]?.['en'];
    }, [language]);

    // Initialize Speech Recognition API
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // --- Core AI Audio Generation Function ---
    const generateAndPlayAudio = async (textToSpeak) => {
        const cleanedText = cleanForSpeech(textToSpeak);
        if (!cleanedText) {
            console.log("Skipping audio generation for empty or invalid text.");
            return;
        }

        // Stop any currently playing audio
        audioPlayer.pause();
        audioPlayer.currentTime = 0;

        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c"; // API key will be injected by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const payload = {
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanedText }] }],
            generationConfig: { responseModalities: ["AUDIO"] }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`TTS API error! status: ${response.status}`);

            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1], 10) || 24000;
                const pcmBuffer = base64ToArrayBuffer(audioData);
                const wavBlob = pcmToWav(pcmBuffer, 1, sampleRate); // Assuming 1 channel
                const audioUrl = URL.createObjectURL(wavBlob);

                audioPlayer.src = audioUrl;
                audioPlayer.play().catch(e => console.error("Audio playback failed:", e));
            } else {
                throw new Error("No audio data in TTS response.");
            }
        } catch (error) {
            console.error("AI audio generation failed:", error);
            // Fallback to browser's native voice if API fails
            const utterance = new SpeechSynthesisUtterance(cleanedText);
            utterance.lang = language;
            speechSynthesis.speak(utterance);
        }
    };

    // --- Core AI Text Response Function ---
    const getAIResponse = async (userQuery, currentChatHistory) => {
        setIsLoading(true);
        setAiResponse('');

        if (page === 'guru-chat') {
            setChatHistory(prev => [...prev, { sender: 'user', text: userQuery }]);
        }

        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Switch persona based on the current page
        const isGuruChat = page === 'guru-chat';
        const systemPrompt = isGuruChat
            ? `You are "Porter Guru," an interactive problem-solving AI expert for drivers. Your goal is to diagnose any problem the driver is facing—whether it's with their vehicle, the Porter Saathi app itself, or understanding their earnings—through a calm, diagnostic conversation.
               **CRITICAL RULE:** Do NOT provide a solution immediately. First, ask simple, clarifying questions one by one to understand the issue fully. Engage in a back-and-forth dialogue.
               
               **Example (App Problem):**
               - Driver: "I don't know how to use the app."
               - You: "I can definitely help you with that. What are you trying to do right now? Are you trying to check your earnings, find a tutorial, or something else?"

               **Core Directives:**
               1.  **Diagnose First:** Always ask questions before giving answers.
               2.  **Language Discipline:** Respond ONLY in the language of this code: ${language}.
               3.  **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".
               4.  **Use Chat History:** Consider the previous messages in this conversation: ${JSON.stringify(currentChatHistory)}.`
            : `You are "Porter Saathi," an expert AI customer support agent for truck drivers in India. Your only goal is to provide clear, precise, and helpful answers.
               **Core Directives:**
               1.  **Data is Fact:** Use this data for answers about earnings: ${JSON.stringify(MOCK_DATA)}.
               2.  **Precision is Key:** Do NOT give vague answers. If you don't know, say so.
               3.  **Language Discipline:** Respond ONLY in the language of this code: ${language}.
               4.  **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".
               5.  **Be Action-Oriented:** Suggest clear next steps (e.g., go to Guru section).`;


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

    // --- Initial Language Selection ---
    if (!language) {
        return <LanguageSelection onSelectLanguage={setLanguage} />;
    }

    // --- Login Page ---
    if (!isLoggedIn) {
        return <LoginPage language={language} onLogin={setIsLoggedIn} t={t} speak={generateAndPlayAudio} />;
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
            case 'guru-chat': return <GuruChatPage chatHistory={chatHistory} isLoading={isLoading} t={t} onBack={() => setPage('guru')} />;
            case 'guru': return <GuruPage onSelectTutorial={setSelectedTutorial} onStartChat={startGuruChat} t={t} language={language} />;
            case 'suraksha': return <SurakshaPage speak={generateAndPlayAudio} t={t} language={language} audioPlayer={audioPlayer} recognition={recognition} />;
            case 'home': default: return <HomePage aiResponse={aiResponse} isLoading={isLoading} t={t} language={language} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto max-w-lg h-screen flex flex-col p-4 bg-white shadow-lg">
                <Header t={t} />
                <main className="flex-grow overflow-y-auto pb-24">{renderPage()}</main>
                <Footer currentPage={page} setPage={setPage} onListen={toggleListen} isListening={isListening} t={t} />
            </div>
        </div>
    );
}

// --- Sub-Components ---

const LanguageSelection = ({ onSelectLanguage }) => {
    const languages = [
        { code: 'hi-IN', name: 'हिंदी (Hindi)' },
        { code: 'en-IN', name: 'English' },
        { code: 'te-IN', name: 'తెలుగు (Telugu)' },
        { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
    ];
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Porter Saathi</h1>
            <h2 className="text-xl font-semibold mb-8 text-gray-700">{translations.chooseLanguage.hi}</h2>
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                {languages.map(lang => (
                    <button key={lang.code} onClick={() => onSelectLanguage(lang.code)} className="bg-white text-blue-600 font-bold py-4 px-6 rounded-lg shadow-md border-2 border-blue-500 hover:bg-blue-50 transition-transform transform hover:scale-105">
                        {lang.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Header = ({ t }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Suprabhat" : hour < 18 ? "Namaste" : "Shubh Ratri";
    return (
        <header className="flex items-center justify-between pb-4 border-b">
            <div>
                <h1 className="text-2xl font-bold text-blue-600">{t('appName')}</h1>
                <p className="text-gray-500">{greeting}, {t('greeting')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">DP</div>
        </header>
    );
};

const Footer = ({ currentPage, setPage, onListen, isListening, t }) => {
    const navItems = [
        { name: 'home', label: t('home'), icon: '🏠' },
        { name: 'guru', label: t('guru'), icon: '🎓' },
        { name: 'suraksha', label: t('suraksha'), icon: '🛡️' },
    ];
    return (
        <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 border-gray-200">
            <div className="flex justify-around items-center h-20">
                {currentPage !== 'guru-chat' && navItems.map(item => (
                    <button key={item.name} onClick={() => setPage(item.name)} className={`flex flex-col items-center justify-center transition-colors duration-200 ${currentPage === item.name ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                ))}
                {currentPage === 'guru-chat' && <div className="w-full h-full"></div>}
            </div>
            <div onClick={onListen} className={`absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 S0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </div>
        </footer>
    );
};

const HomePage = ({ aiResponse, isLoading, t, language }) => {
    const { revenue, expenses, trips } = MOCK_DATA.earnings.today;
    const langKey = language.split('-')[0];

    return (
        <div className="p-4 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h2 className="text-lg font-semibold text-blue-800">{t('todaysEarnings')}</h2>
                <p className="text-4xl font-bold text-green-600 mt-2">₹{revenue - expenses}</p>
                <div className="flex justify-around mt-4 text-sm">
                    <div><p className="text-gray-500">{t('totalRevenue')}</p><p className="font-bold text-gray-800">₹{revenue}</p></div>
                    <div><p className="text-gray-500">{t('expenses')}</p><p className="font-bold text-gray-800">- ₹{expenses}</p></div>
                    <div><p className="text-gray-500">{t('trips')}</p><p className="font-bold text-gray-800">{trips}</p></div>
                </div>
            </div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 min-h-[6rem] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center text-gray-500"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2">{t('thinking')}</p></div>
                ) : (<p className="text-center text-gray-700 font-medium">{aiResponse || t('askAnything')}</p>)}
            </div>
            <div className="text-center text-gray-500">
                <p>{t('clickMicAndSpeak')}</p>
                <p className="font-semibold mt-1">{translations.exampleQuestion[langKey] || translations.exampleQuestion['en']}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-orange-800">{t('penaltyReward')}</h3>
                <div className="mt-2 text-sm text-gray-700 flex items-start"><span className="text-lg mr-2">⚠️</span><p>{t('penaltyText')}</p></div>
            </div>
        </div>
    );
};

const GuruPage = ({ onSelectTutorial, onStartChat, t, language }) => {
    const langKey = language.split('-')[0];
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-6">{t('guruTitle')}</h2>

            <div onClick={onStartChat} className="bg-blue-500 text-white p-4 rounded-lg shadow-lg mb-8 text-center cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <h3 className="font-bold text-lg">{t('talkToGuru')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {MOCK_DATA.tutorials.map(tutorial => (
                    <div key={tutorial.id} onClick={() => onSelectTutorial(tutorial)} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 text-center cursor-pointer hover:shadow-lg transition-shadow">
                        <p className="text-3xl mb-2">{tutorial.id === 1 ? '📜' : tutorial.id === 2 ? '🚗' : tutorial.id === 3 ? '🔒' : '😊'}</p>
                        <h3 className="font-semibold text-sm">{tutorial.title[langKey] || tutorial.title['en']}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GuruChatPage = ({ chatHistory, isLoading, t, onBack }) => {
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

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
        </div>
    );
};


const TutorialDetail = ({ tutorial, onBack, speak, t, language }) => {
    const langKey = language.split('-')[0];
    const title = tutorial.title[langKey] || tutorial.title['en'];
    const steps = tutorial.steps[langKey] || tutorial.steps['en'];

    useEffect(() => {
        speak(`${title}. ${steps[0]}`);
    }, [tutorial, speak, title, steps]);

    return (
        <div className="p-4 animate-fade-in">
            <button onClick={onBack} className="flex items-center text-blue-600 font-semibold mb-4">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                {t('goBack')}
            </button>
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <ul className="space-y-3">
                {steps.map((step, index) => (
                    <li key={index} onClick={() => speak(step)} className="flex items-center bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4">{index + 1}</div>
                        <span className="flex-1 text-gray-800">{step}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
};

const SurakshaPage = ({ speak, t, language, audioPlayer, recognition }) => {
    const [emergencyState, setEmergencyState] = useState('idle'); // idle, confirming, confirmed
    const [locationAlert, setLocationAlert] = useState('');
    const [isCheckingLocation, setIsCheckingLocation] = useState(false);
    const emergencyRecognizerRef = useRef(null);

    // Memoize handlers to prevent re-creation on re-renders
    const confirmEmergency = useCallback(() => {
        setEmergencyState('confirmed');
        speak(t('requestSent'));
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
    }, [language, t, confirmEmergency, cancelEmergency]);

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
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.s998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {t('checkLocation')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const LoginPage = ({ language, onLogin, t, speak }) => {
    const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Speak instructions when component mounts
    useEffect(() => {
        const welcomeMsg = `${t('loginTitle')}. ${t('enterMobile')}`;
        speak(welcomeMsg);
    }, [t, speak]);

    const validateMobile = (mobile) => {
        return /^[6-9]\d{9}$/.test(mobile);
    };

    const validateOTP = (otpValue) => {
        return /^\d{6}$/.test(otpValue);
    };

    const handleSendOTP = () => {
        setError('');
        if (!validateMobile(mobileNumber)) {
            const errorMsg = t('invalidMobile');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setStep('otp');
            setIsLoading(false);
            const otpMsg = t('otpSent');
            speak(otpMsg);
        }, 1500);
    };

    const handleVerifyOTP = () => {
        setError('');
        if (!validateOTP(otp)) {
            const errorMsg = t('invalidOTP');
            setError(errorMsg);
            speak(errorMsg);
            return;
        }
        
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onLogin(true);
        }, 1500);
    };

    const handleResendOTP = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setError('');
            const resendMsg = t('otpSent');
            speak(resendMsg);
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">Porter Saathi</h1>
                    <h2 className="text-xl font-semibold text-gray-700">{t('loginTitle')}</h2>
                </div>

                {step === 'mobile' ? (
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
                ) : (
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


// --- Mock Data ---
const MOCK_DATA = {
    earnings: { today: { revenue: 1250, expenses: 300, trips: 8 }, lastWeek: { revenue: 7800, expenses: 2100, trips: 55 } },
    tutorials: [
        {
            id: 1,
            category: "challan",
            title: {
                hi: "ट्रैफिक चालान कैसे भरें?",
                en: "How to Pay a Traffic Challan?",
                te: "ట్రాఫిక్ చలాన్ ఎలా చెల్లించాలి?",
                ta: "போக்குவரத்து சலானை எப்படி செலுத்துவது?"
            },
            steps: {
                hi: ["चालान का फोटो लें", "ऐप में अपलोड करें", "ऑनलाइन पेमेंट करें", "कन्फर्मेशन का इंतज़ार करें"],
                en: ["Take a photo of the challan", "Upload it in the app", "Make online payment", "Wait for confirmation"],
                te: ["చలాన్ ఫోటో తీయండి", "యాప్‌లో అప్‌లోడ్ చేయండి", "ఆన్‌లైన్‌లో చెల్లించండి", "నిర్ధారణ కోసం వేచి ఉండండి"],
                ta: ["சலானின் புகைப்படம் எடுக்கவும்", "பயன்பாட்டில் பதிவேற்றவும்", "ஆன்லைனில் பணம் செலுத்தவும்", "உறுதிப்படுத்தலுக்காக காத்திருக்கவும்"]
            }
        },
        {
            id: 2,
            category: "insurance",
            title: {
                hi: "गाड़ी का बीमा कैसे क्लेम करें?",
                en: "How to Claim Vehicle Insurance?",
                te: "వాహన బీమాను ఎలా క్లెయిమ్ చేయాలి?",
                ta: "வாகனக் காப்பீட்டை எப்படி கோருவது?"
            },
            steps: {
                hi: ["दुर्घटना की रिपोर्ट करें", "बीमा कंपनी को कॉल करें", "सर्वेयर का इंतज़ार करें", "दस्तावेज़ जमा करें"],
                en: ["Report the accident", "Call the insurance company", "Wait for the surveyor", "Submit the documents"],
                te: ["ప్రమాదాన్ని నివేదించండి", "భీమా కంపెనీకి కాల్ చేయండి", "సర్వేయర్ కోసం వేచి ఉండండి", "పత్రాలను సమర్పించండి"],
                ta: ["விபத்தைப் புகாரளிக்கவும்", "காப்பீட்டு நிறுவனத்தை அழைக்கவும்", "சர்வேயருக்காக காத்திருக்கவும்", "ஆவணங்களைச் சமர்ப்பிக்கவும்"]
            }
        },
        {
            id: 3,
            category: "digilocker",
            title: {
                hi: "डिजीलॉकर में दस्तावेज़ कैसे रखें?",
                en: "How to Keep Documents in DigiLocker?",
                te: "డిజీలాకర్‌లో పత్రాలను ఎలా ఉంచాలి?",
                ta: "டிஜிலாக்கரில் ஆவணங்களை எப்படி வைப்பது?"
            },
            steps: {
                hi: ["डिजीलॉकर ऐप डाउनलोड करें", "आधार से लिंक करें", "अपने दस्तावेज़ प्राप्त करें", "सुरक्षित रखें"],
                en: ["Download the DigiLocker app", "Link with Aadhaar", "Fetch your documents", "Keep them safe and secure"],
                te: ["డిజీలాకర్ యాప్ డౌన్‌లోడ్ చేసుకోండి", "ఆధార్‌తో లింక్ చేయండి", "మీ పత్రాలను పొందండి", "వాటిని సురక్షితంగా ఉంచండి"],
                ta: ["டிஜிலாக்கர் செயலியைப் பதிவிறக்கவும்", "ஆதாருடன் இணைக்கவும்", "உங்கள் ஆவணங்களைப் பெறவும்", "பாதுப்பாக வைக்கவும்"]
            }
        },
        {
            id: 4,
            category: "customer",
            title: {
                hi: "ग्राहक से कैसे बात करें?",
                en: "How to Talk to Customers?",
                te: "వినియోగదారులతో ఎలా మాట్లాడాలి?",
                ta: "வாடிக்கையாளர்களிடம் எப்படி பேசுவது?"
            },
            steps: {
                hi: ["हमेशा मुस्कुराएं", "विनम्रता से बात करें", "समस्या ध्यान से सुनें", "मदद करने की कोशिश करें"],
                en: ["Always smile", "Speak politely", "Listen to the problem carefully", "Try to help"],
                te: ["ఎల్లప్పుడూ నవ్వండి", "మర్యాదగా మాట్లాడండి", "సమస్యను జాగ్రత్తగా వినండి", "సహాయం చేయడానికి ప్రయత్నించండి"],
                ta: ["எப்போதும் சிரிக்கவும்", "பணிவாகப் பேசுங்கள்", "சிக்கலை கவனமாகக் கேளுங்கள்", "உதவ முயற்சிக்கவும்"]
            }
        }
    ]
};

