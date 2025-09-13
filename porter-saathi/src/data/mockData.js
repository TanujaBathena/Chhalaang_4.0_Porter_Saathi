// Mock data for Porter Saathi app
export const MOCK_DATA = {
    earnings: { 
        today: { revenue: 1250, expenses: 300, trips: 8 }, 
        lastWeek: { revenue: 7800, expenses: 2100, trips: 55 } 
    },
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
                hi: ["चालान का फोटो लें", "ऐप में अपलोड करें", "ऑनलाइन पेमेंट करें", "कन्फर्मेशन का इंतज़ार करें"],
                en: ["Take a photo of the challan", "Upload it in the app", "Make online payment", "Wait for confirmation"],
                te: ["చలాన్ ఫోటో తీయండి", "యాప్‌లో అప్‌లోడ్ చేయండి", "ఆన్‌లైన్‌లో చెల్లించండి", "నిర్ధారణ కోసం వేచి ఉండండి"],
                ta: ["சலானின் புகைப்படம் எடுக்கவும்", "பயன்பாட்டில் பதிவேற்றவும்", "ஆன்லைனில் பணம் செலுத்தவும்", "உறுதிப்படுத்தலுக்காக காத்திருக்கவும்"]
            },
            videos: [
                {
                    id: 1,
                    title: {
                        hi: "चालान फोटो कैसे लें",
                        en: "How to Take Challan Photo",
                        te: "చలాన్ ఫోటో ఎలా తీయాలి",
                        ta: "சலான் புகைப்படம் எப்படி எடுப்பது"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "4:16",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 2,
                    title: {
                        hi: "ऐप में अपलोड करना",
                        en: "Uploading in the App",
                        te: "యాప్‌లో అప్‌లోడ్ చేయడం",
                        ta: "பயன்பாட்டில் பதிவேற்றுதல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:15",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 3,
                    title: {
                        hi: "ऑनलाइन पेमेंट प्रक्रिया",
                        en: "Online Payment Process",
                        te: "ఆన్‌లైన్ చెల్లింపు ప్రక్రియ",
                        ta: "ஆன்லைன் பணம் செலுத்தும் செயல்முறை"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "4:20",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 4,
                    title: {
                        hi: "कन्फर्मेशन चेक करना",
                        en: "Checking Confirmation",
                        te: "నిర్ధారణ తనిఖీ చేయడం",
                        ta: "உறுதிப்படுத்தலை சரிபார்த்தல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "1:45",
                    videoThumbnail: "/api/placeholder/320/180"
                }
            ]
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
                hi: ["दुर्घटना की रिपोर्ट करें", "बीमा कंपनी को कॉल करें", "सर्वेयर का इंतज़ार करें", "दस्तावेज़ जमा करें"],
                en: ["Report the accident", "Call the insurance company", "Wait for the surveyor", "Submit the documents"],
                te: ["ప్రమాదాన్ని నివేదించండి", "భీమా కంపెనీకి కాल్ చేయండి", "సర్వేయర్ కోసం వేచి ఉండండి", "పత్రాలను సమర్పించండి"],
                ta: ["விபத்தைப் புகாரளிக்கவும்", "காப்பீட்டு நிறுவனத்தை அழைக்கவும்", "சர்வேயருக்காக காத்திருக்கவும்", "ஆவணங்களைச் சமர்ப்பிக்கவும்"]
            },
            videos: [
                {
                    id: 1,
                    title: {
                        hi: "दुर्घटना रिपोर्ट कैसे करें",
                        en: "How to Report an Accident",
                        te: "ప్రమాదాన్ని ఎలా నివేదించాలి",
                        ta: "விபத்தை எப்படி புகாரளிப்பது"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:45",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 2,
                    title: {
                        hi: "बीमा कंपनी से संपर्क",
                        en: "Contacting Insurance Company",
                        te: "భీమా కంపెనీని సంప్రదించడం",
                        ta: "காப்பீட்டு நிறுவனத்தை தொடர்பு கொள்ளுதல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "4:30",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 3,
                    title: {
                        hi: "सर्वेयर प्रक्रिया",
                        en: "Surveyor Process",
                        te: "సర్వేయర్ ప్రక్రియ",
                        ta: "சர்வேயர் செயல்முறை"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "6:15",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 4,
                    title: {
                        hi: "दस्तावेज़ जमा करना",
                        en: "Document Submission",
                        te: "పత్రాల సమర్పణ",
                        ta: "ஆவண சமர்ப்பணம்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:20",
                    videoThumbnail: "/api/placeholder/320/180"
                }
            ]
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
            },
            videos: [
                {
                    id: 1,
                    title: {
                        hi: "डिजीलॉकर ऐप डाउनलोड करना",
                        en: "Downloading DigiLocker App",
                        te: "డిజీలాకర్ యాప్ డౌన్‌లోడ్ చేయడం",
                        ta: "டிஜிலாக்கர் செயலியைப் பதிவிறக்குதல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "2:45",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 2,
                    title: {
                        hi: "आधार से लिंक करना",
                        en: "Linking with Aadhaar",
                        te: "ఆధార్‌తో లింక్ చేయడం",
                        ta: "ஆதாருடன் இணைத்தல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:30",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 3,
                    title: {
                        hi: "दस्तावेज़ प्राप्त करना",
                        en: "Fetching Documents",
                        te: "పత్రాలను పొందడం",
                        ta: "ஆவணங்களைப் பெறுதல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "4:00",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 4,
                    title: {
                        hi: "सुरक्षित भंडारण",
                        en: "Secure Storage",
                        te: "సురక్షిత నిల్వ",
                        ta: "பாதுகாப்பான சேமிப்பு"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "2:15",
                    videoThumbnail: "/api/placeholder/320/180"
                }
            ]
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
            },
            videos: [
                {
                    id: 1,
                    title: {
                        hi: "सकारात्मक व्यवहार",
                        en: "Positive Behavior",
                        te: "సానుకూల ప్రవర్తన",
                        ta: "நேர்மறையான நடத்தை"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:15",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 2,
                    title: {
                        hi: "विनम्र संवाद",
                        en: "Polite Communication",
                        te: "మర్యాదపూర్వక సంభాషణ",
                        ta: "பணிவான தொடர்பு"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "4:45",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 3,
                    title: {
                        hi: "समस्या समाधान",
                        en: "Problem Solving",
                        te: "సమస్య పరిష్కారం",
                        ta: "சிக்கல் தீர்த்தல்"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "5:30",
                    videoThumbnail: "/api/placeholder/320/180"
                },
                {
                    id: 4,
                    title: {
                        hi: "ग्राहक संतुष्टि",
                        en: "Customer Satisfaction",
                        te: "కస్టమర్ సంతృప్తి",
                        ta: "வாடிக்கையாளர் திருப்தி"
                    },
                    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                    videoDuration: "3:45",
                    videoThumbnail: "/api/placeholder/320/180"
                }
            ]
        }
    ]
}; 