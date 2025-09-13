/** 
 * AI Service for Porter Saathi Empowerment Module
 * Handles real-time AI-powered lookups for government schemes and driver rights
 */

// Mock AI responses for demonstration - In production, replace with actual LLM API calls
const MOCK_AI_RESPONSES = {
    schemes: {
        'en-IN': {
            'vehicle_upgrade': [
                {
                    name: 'Mudra Yojana - Tarun',
                    description: 'Business loan for vehicle upgrade and expansion',
                    subsidy: '₹10 lakh loan with subsidized interest rates',
                    eligibility: 'Small transport business owners, existing vehicle owners',
                    processingTime: '15-30 days',
                    contact: 'Nearest bank or MUDRA portal',
                    documents: ['Aadhaar Card', 'Vehicle RC', 'Business Registration', 'Income Proof'],
                    applicationProcess: 'Visit bank → Submit documents → Loan approval → Vehicle purchase'
                },
                {
                    name: 'Stand Up India Scheme',
                    description: 'Bank loans for SC/ST/Women entrepreneurs in transport',
                    subsidy: '₹10 lakh to ₹1 crore with government guarantee',
                    eligibility: 'SC/ST/Women, first-time entrepreneurs',
                    processingTime: '45-60 days',
                    contact: 'Scheduled Commercial Banks',
                    documents: ['Aadhaar', 'Caste Certificate', 'Business Plan', 'Vehicle Quotation'],
                    applicationProcess: 'Bank application → Document verification → Loan sanction → Vehicle purchase'
                }
            ],
            'business_loan': [
                {
                    name: 'PM SVANidhi Scheme',
                    description: 'Micro credit for small transport vendors',
                    subsidy: '₹10,000 to ₹50,000 collateral-free loan',
                    eligibility: 'Street vendors, small transport operators',
                    processingTime: '7-15 days',
                    contact: 'Participating banks and NBFCs',
                    documents: ['Aadhaar', 'Vendor Certificate', 'Bank Account'],
                    applicationProcess: 'Online application → Document upload → Quick approval'
                }
            ]
        },
        'hi-IN': {
            'vehicle_upgrade': [
                {
                    name: 'मुद्रा योजना - तरुण',
                    description: 'वाहन अपग्रेड और व्यापार विस्तार के लिए बिजनेस लोन',
                    subsidy: '₹10 लाख तक का लोन सब्सिडी दर पर',
                    eligibility: 'छोटे परिवहन व्यापारी, मौजूदा वाहन मालिक',
                    processingTime: '15-30 दिन',
                    contact: 'नजदीकी बैंक या मुद्रा पोर्टल',
                    documents: ['आधार कार्ड', 'वाहन RC', 'व्यापार पंजीकरण', 'आय प्रमाण'],
                    applicationProcess: 'बैंक जाएं → दस्तावेज जमा करें → लोन अप्रूवल → वाहन खरीदें'
                },
                {
                    name: 'स्टैंड अप इंडिया योजना',
                    description: 'परिवहन में SC/ST/महिला उद्यमियों के लिए बैंक लोन',
                    subsidy: '₹10 लाख से ₹1 करोड़ तक सरकारी गारंटी के साथ',
                    eligibility: 'SC/ST/महिला, पहली बार उद्यमी',
                    processingTime: '45-60 दिन',
                    contact: 'अनुसूचित वाणिज्यिक बैंक',
                    documents: ['आधार', 'जाति प्रमाण पत्र', 'व्यापार योजना', 'वाहन कोटेशन'],
                    applicationProcess: 'बैंक आवेदन → दस्तावेज सत्यापन → लोन मंजूरी → वाहन खरीद'
                }
            ]
        },
        'te-IN': {
            'vehicle_upgrade': [
                {
                    name: 'ముద్రా యోజన - తరుణ్',
                    description: 'వాహన అప్‌గ్రేడ్ మరియు వ్యాపార విస్తరణ కోసం బిజినెస్ లోన్',
                    subsidy: '₹10 లక్షల వరకు సబ్సిడీ రేటుతో లోన్',
                    eligibility: 'చిన్న రవాణా వ్యాపారులు, ప్రస్తుత వాహన యజమానులు',
                    processingTime: '15-30 రోజులు',
                    contact: 'సమీప బ్యాంక్ లేదా ముద్రా పోర్టల్',
                    documents: ['ఆధార్ కార్డ్', 'వాహన RC', 'వ్యాపార రిజిస్ట్రేషన్', 'ఆదాయ రుజువు'],
                    applicationProcess: 'బ్యాంక్‌కు వెళ్లండి → పత్రాలు సమర్పించండి → లోన్ ఆమోదం → వాహనం కొనుగోలు'
                }
            ]
        },
        'ta-IN': {
            'vehicle_upgrade': [
                {
                    name: 'முத்ரா யோஜனா - தருண்',
                    description: 'வாகன மேம்படுத்தல் மற்றும் வணிக விரிவாக்கத்திற்கான வணிக கடன்',
                    subsidy: '₹10 லட்சம் வரை மானிய வட்டி விகிதத்தில் கடன்',
                    eligibility: 'சிறு போக்குவரத்து வணிகர்கள், தற்போதைய வாகன உரிமையாளர்கள்',
                    processingTime: '15-30 நாட்கள்',
                    contact: 'அருகிலுள்ள வங்கி அல்லது முத்ரா போர்ட்டல்',
                    documents: ['ஆதார் கார்டு', 'வாகன RC', 'வணிக பதிவு', 'வருமான சான்று'],
                    applicationProcess: 'வங்கிக்கு செல்லுங்கள் → ஆவணங்களை சமர்ப்பிக்கவும் → கடன் ஒப்புதல் → வாகன வாங்கல்'
                }
            ]
        }
    },
    rights: {
        'en-IN': {
            'traffic_fine': [
                {
                    title: 'Right to Contest Traffic Challan',
                    description: 'You have the legal right to contest any traffic fine you believe is wrongly issued',
                    legalBasis: 'Motor Vehicle Act 1988, Section 207',
                    howToExercise: [
                        'Take photos of the incident location and your vehicle',
                        'Note down the challan number and officer details',
                        'Visit the nearest traffic court within 30 days',
                        'Submit your evidence and explanation'
                    ],
                    contactForHelp: [
                        'Traffic Court: Visit local magistrate court',
                        'RTO Helpline: 1800-267-0001',
                        'Online Portal: parivahan.gov.in'
                    ]
                },
                {
                    title: 'Right to Proper Documentation',
                    description: 'Police must provide proper challan with clear violation details',
                    legalBasis: 'Motor Vehicle Act 1988, Section 206',
                    howToExercise: [
                        'Demand written challan with violation details',
                        'Ask for officer badge number and name',
                        'Request receipt for any fine paid on spot',
                        'Take photo of challan for your records'
                    ],
                    contactForHelp: [
                        'Traffic Police Station: File complaint',
                        'Citizen Helpline: 100',
                        'RTI Application: For transparency'
                    ]
                }
            ],
            'payment_dispute': [
                {
                    title: 'Right to Payment for Services',
                    description: 'You have the right to receive agreed payment for transport services rendered',
                    legalBasis: 'Contract Act 1872, Consumer Protection Act 2019',
                    howToExercise: [
                        'Keep written agreement or booking confirmation',
                        'Document the service provided (photos, GPS logs)',
                        'Send legal notice for payment demand',
                        'File complaint in consumer court if amount > ₹20,000'
                    ],
                    contactForHelp: [
                        'Consumer Court: For disputes above ₹20,000',
                        'Lok Adalat: For quick resolution',
                        'Legal Aid: District Legal Services Authority'
                    ]
                }
            ]
        },
        'hi-IN': {
            'traffic_fine': [
                {
                    title: 'ट्रैफिक चालान का विरोध करने का अधिकार',
                    description: 'आपको किसी भी गलत ट्रैफिक फाइन का विरोध करने का कानूनी अधिकार है',
                    legalBasis: 'मोटर वाहन अधिनियम 1988, धारा 207',
                    howToExercise: [
                        'घटना स्थल और अपने वाहन की तस्वीरें लें',
                        'चालान नंबर और अधिकारी का विवरण नोट करें',
                        '30 दिन के भीतर नजदीकी ट्रैफिक कोर्ट जाएं',
                        'अपने सबूत और स्पष्टीकरण जमा करें'
                    ],
                    contactForHelp: [
                        'ट्रैफिक कोर्ट: स्थानीय मजिस्ट्रेट कोर्ट जाएं',
                        'RTO हेल्पलाइन: 1800-267-0001',
                        'ऑनलाइन पोर्टल: parivahan.gov.in'
                    ]
                }
            ],
            'payment_dispute': [
                {
                    title: 'सेवाओं के लिए भुगतान का अधिकार',
                    description: 'आपको प्रदान की गई परिवहन सेवाओं के लिए सहमत भुगतान प्राप्त करने का अधिकार है',
                    legalBasis: 'अनुबंध अधिनियम 1872, उपभोक्ता संरक्षण अधिनियम 2019',
                    howToExercise: [
                        'लिखित समझौता या बुकिंग पुष्टि रखें',
                        'प्रदान की गई सेवा का दस्तावेजीकरण करें',
                        'भुगतान मांग के लिए कानूनी नोटिस भेजें',
                        '₹20,000 से अधिक राशि के लिए उपभोक्ता कोर्ट में शिकायत दर्ज करें'
                    ],
                    contactForHelp: [
                        'उपभोक्ता कोर्ट: ₹20,000 से अधिक विवादों के लिए',
                        'लोक अदालत: त्वरित समाधान के लिए',
                        'कानूनी सहायता: जिला कानूनी सेवा प्राधिकरण'
                    ]
                }
            ]
        }
    }
};

/**
 * AI-powered lookup for government schemes using Gemini AI
 */
export const getGovernmentSchemes = async (query, language = 'en-IN', intent = 'vehicle_upgrade') => {
    try {
        console.log('Getting AI schemes for query:', query, 'Language:', language, 'Intent:', intent);
        
        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = `You are an expert AI assistant for Indian truck drivers seeking government schemes and loans. Your task is to provide accurate, helpful information about government schemes for vehicle loans, business expansion, and transport-related financial assistance.

CRITICAL INSTRUCTIONS:
1. Respond ONLY in ${language} language
2. Focus on REAL Indian government schemes like Mudra Yojana, Stand Up India, PM SVANidhi, etc.
3. Provide practical, actionable information
4. Include eligibility, loan amounts, processing time, and application steps
5. Be empathetic and encouraging
6. Your response MUST be a valid JSON object with this structure:
{
  "schemes": [
    {
      "name": "Scheme name in ${language}",
      "description": "Brief description in ${language}",
      "subsidy": "Loan amount/subsidy details",
      "eligibility": "Who can apply",
      "processingTime": "How long it takes",
      "contact": "Where to apply",
      "documents": ["Required documents"],
      "applicationProcess": "Step by step process"
    }
  ],
  "voiceResponse": "Conversational response in ${language} that I can speak to the user",
  "totalFound": 2
}

User Query: "${query}"
Intent: ${intent}

Provide 2-3 most relevant schemes for this query.`;

        const payload = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: query }] }],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (rawText) {
            const aiResponse = JSON.parse(rawText);
            console.log('AI Schemes Response:', aiResponse);
            
            return {
                success: true,
                schemes: aiResponse.schemes || [],
                totalFound: aiResponse.totalFound || aiResponse.schemes?.length || 0,
                language: language,
                query: query,
                voiceResponse: aiResponse.voiceResponse
            };
        } else {
            throw new Error("No content in AI response");
        }
    } catch (error) {
        console.error('AI Schemes Lookup Error:', error);
        
        // Fallback to mock data if AI fails
        const schemes = MOCK_AI_RESPONSES.schemes[language]?.[intent] || 
                       MOCK_AI_RESPONSES.schemes['en-IN'][intent] || [];
        
        return {
            success: true,
            schemes: schemes,
            totalFound: schemes.length,
            language: language,
            query: query,
            voiceResponse: generateVoiceResponse(schemes, 'schemes', language)
        };
    }
};

/**
 * AI-powered lookup for driver rights using Gemini AI
 */
export const getDriverRights = async (query, language = 'en-IN', grievanceType = 'traffic_fine') => {
    try {
        console.log('Getting AI rights for query:', query, 'Language:', language, 'Grievance:', grievanceType);
        
        const apiKey = "AIzaSyChUrdf5nMkO5qce6H-ve16gchA4dHP30c";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = `You are an expert legal AI assistant for Indian truck drivers seeking help with their rights and legal issues. Your task is to provide accurate, helpful information about driver rights, legal procedures, and grievance redressal mechanisms in India.

CRITICAL INSTRUCTIONS:
1. Respond ONLY in ${language} language
2. Focus on REAL Indian laws like Motor Vehicle Act 1988, Consumer Protection Act 2019, etc.
3. Provide practical, actionable legal guidance
4. Include legal basis, step-by-step procedures, and contact information
5. Be empathetic and supportive
6. Your response MUST be a valid JSON object with this structure:
{
  "rights": [
    {
      "title": "Right title in ${language}",
      "description": "Brief description in ${language}",
      "legalBasis": "Legal act/section reference",
      "howToExercise": ["Step 1", "Step 2", "Step 3"],
      "contactForHelp": ["Contact option 1", "Contact option 2"]
    }
  ],
  "voiceResponse": "Conversational response in ${language} that I can speak to the user",
  "totalFound": 2
}

User Query: "${query}"
Grievance Type: ${grievanceType}

Provide 2-3 most relevant rights and legal options for this issue.`;

        const payload = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: query }] }],
            generationConfig: { 
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (rawText) {
            const aiResponse = JSON.parse(rawText);
            console.log('AI Rights Response:', aiResponse);
            
            return {
                success: true,
                rights: aiResponse.rights || [],
                totalFound: aiResponse.totalFound || aiResponse.rights?.length || 0,
                language: language,
                grievanceType: grievanceType,
                query: query,
                voiceResponse: aiResponse.voiceResponse
            };
        } else {
            throw new Error("No content in AI response");
        }
    } catch (error) {
        console.error('AI Rights Lookup Error:', error);
        
        // Fallback to mock data if AI fails
        const rights = MOCK_AI_RESPONSES.rights[language]?.[grievanceType] || 
                      MOCK_AI_RESPONSES.rights['en-IN'][grievanceType] || [];
        
        return {
            success: true,
            rights: rights,
            totalFound: rights.length,
            language: language,
            grievanceType: grievanceType,
            query: query,
            voiceResponse: generateVoiceResponse(rights, 'rights', language)
        };
    }
};

/**
 * Enhanced Intent classification for user queries
 * Better handles loan-related queries and vehicle financing
 */
export const classifyIntent = (query, language = 'en-IN') => {
    const lowerQuery = query.toLowerCase();
    console.log('Classifying query:', lowerQuery, 'Language:', language);
    
    // Enhanced scheme-related keywords with more loan variations
    const schemeKeywords = {
        'en-IN': ['loan', 'scheme', 'upgrade', 'truck', 'vehicle', 'business', 'money', 'finance', 'subsidy', 'credit', 'funding', 'apply', 'bank', 'mudra', 'standup'],
        'hi-IN': ['लोन', 'योजना', 'अपग्रेड', 'ट्रक', 'वाहन', 'व्यापार', 'पैसा', 'वित्त', 'सब्सिडी', 'बड़ा', 'छोटा', 'कैसे', 'लू', 'ले', 'मिलेगा', 'चाहिए', 'बैंक', 'मुद्रा', 'क्रेडिट'],
        'te-IN': ['లోన్', 'పథకం', 'అప్‌గ్రేడ్', 'ట్రక్', 'వాహనం', 'వ్యాపారం', 'డబ్బు', 'ఫైనాన్స్', 'ఎలా', 'తీసుకోవాలి', 'కావాలి', 'బ్యాంక్', 'క్రెడిట్'],
        'ta-IN': ['கடன்', 'திட்டம்', 'மேம்படுத்தல்', 'டிரக்', 'வாகனம்', 'வணிகம்', 'பணம்', 'நிதி', 'எப்படி', 'வேண்டும்', 'வங்கி', 'கிரெடிட்']
    };
    
    // Rights-related keywords
    const rightsKeywords = {
        'en-IN': ['fine', 'police', 'challan', 'payment', 'customer', 'dispute', 'rights', 'help', 'problem', 'wrong', 'illegal', 'unfair'],
        'hi-IN': ['फाइन', 'पुलिस', 'चालान', 'भुगतान', 'ग्राहक', 'विवाद', 'अधिकार', 'मदद', 'समस्या', 'गलत', 'गैरकानूनी', 'अन्याय'],
        'te-IN': ['ఫైన్', 'పోలీస్', 'చలాన్', 'చెల్లింపు', 'కస్టమర్', 'వివాదం', 'హక్కులు', 'సహాయం', 'తప్పు', 'చట్టవిరుద్ధం'],
        'ta-IN': ['அபராதம்', 'போலீஸ்', 'சலான்', 'பணம்', 'வாடிக்கையாளர்', 'சர்ச்சை', 'உரிமைகள்', 'உதவி', 'தவறு', 'சட்டவிரோதம்']
    };
    
    const langSchemeKeywords = schemeKeywords[language] || schemeKeywords['en-IN'];
    const langRightsKeywords = rightsKeywords[language] || rightsKeywords['en-IN'];
    
    const hasSchemeKeywords = langSchemeKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasRightsKeywords = langRightsKeywords.some(keyword => lowerQuery.includes(keyword));
    
    console.log('Scheme keywords found:', hasSchemeKeywords);
    console.log('Rights keywords found:', hasRightsKeywords);
    
    // Enhanced loan detection
    const loanPatterns = {
        'en-IN': /\b(loan|credit|finance|funding|money|scheme)\b/i,
        'hi-IN': /\b(लोन|लू|ले|क्रेडिट|पैसा|योजना|वित्त|मिलेगा|चाहिए)\b/i,
        'te-IN': /\b(లోన్|డబ్బు|పథకం|ఫైనాన్స్|కావాలి|తీసుకోవాలి)\b/i,
        'ta-IN': /\b(கடன்|பணம்|திட்டம்|நிதி|வேண்டும்)\b/i
    };
    
    const vehiclePatterns = {
        'en-IN': /\b(vehicle|truck|car|upgrade|buy|purchase)\b/i,
        'hi-IN': /\b(वाहन|ट्रक|गाड़ी|अपग्रेड|खरीदना|लेना|बड़ा|छोटा)\b/i,
        'te-IN': /\b(వాహనం|ట్రక్|కారు|అప్‌గ్రేడ్|కొనుగోలు)\b/i,
        'ta-IN': /\b(வாகனம்|டிரக்|கார்|மேம்படுத்தல்|வாங்க)\b/i
    };
    
    const hasLoanPattern = loanPatterns[language]?.test(lowerQuery) || loanPatterns['en-IN'].test(lowerQuery);
    const hasVehiclePattern = vehiclePatterns[language]?.test(lowerQuery) || vehiclePatterns['en-IN'].test(lowerQuery);
    
    if ((hasSchemeKeywords || hasLoanPattern) && !hasRightsKeywords) {
        const intent = (hasVehiclePattern || lowerQuery.includes('upgrade') || lowerQuery.includes('बड़ा') || lowerQuery.includes('अपग्रेड')) ? 'vehicle_upgrade' : 'business_loan';
        console.log('Classified as schemes with intent:', intent);
        return {
            type: 'schemes',
            intent: intent,
            confidence: 0.9
        };
    } else if (hasRightsKeywords && !hasSchemeKeywords) {
        const grievanceType = (lowerQuery.includes('fine') || lowerQuery.includes('police') || lowerQuery.includes('फाइन') || lowerQuery.includes('पुलिस')) ? 'traffic_fine' : 'payment_dispute';
        console.log('Classified as rights with grievance type:', grievanceType);
        return {
            type: 'rights',
            grievanceType: grievanceType,
            confidence: 0.9
        };
    }
    
    // Default fallback - if unclear, assume schemes (most common query)
    console.log('Defaulting to schemes classification');
    return {
        type: 'schemes',
        intent: 'vehicle_upgrade',
        confidence: 0.5
    };
};

/**
 * Generate voice-friendly response summary
 */
export const generateVoiceResponse = (data, type, language = 'en-IN') => {
    const responses = {
        schemes: {
            'en-IN': (schemes) => {
                if (schemes.length === 0) return "I couldn't find any relevant schemes right now. Let me try again later.";
                const first = schemes[0];
                return `Great! I found ${schemes.length} excellent schemes for you. The top one is ${first.name}. You can get ${first.subsidy}. The eligibility is ${first.eligibility}. Would you like me to explain the application process?`;
            },
            'hi-IN': (schemes) => {
                if (schemes.length === 0) return "मुझे अभी कोई लोन योजना नहीं मिली, लेकिन चिंता न करें! हमेशा विकल्प उपलब्ध हैं। आप अपने नजदीकी बैंक जा सकते हैं या मुद्रा योजना पोर्टल देख सकते हैं।";
                const first = schemes[0];
                return `शानदार खबर! मैंने आपके वाहन की जरूरत के लिए ${schemes.length} परफेक्ट लोन योजनाएं पाई हैं। सबसे बेहतरीन है ${first.name}। आप ${first.subsidy} तक पा सकते हैं आसान पात्रता के साथ। मुख्य शर्त है ${first.eligibility}। प्रोसेसिंग सिर्फ ${first.processingTime} में हो जाती है। क्या मैं आपको स्टेप बाई स्टेप आवेदन प्रक्रिया बताऊं?`;
            },
            'te-IN': (schemes) => {
                if (schemes.length === 0) return "నాకు ప్రస్తుతం సంబంధిత పథకాలు దొరకలేదు. నేను తర్వాత మళ్లీ ప్రయత్నిస్తాను।";
                const first = schemes[0];
                return `అద్భుతం! మీ కోసం ${schemes.length} అద్భుతమైన పథకాలను కనుగొన్నాను. అత్యుత్తమమైనది ${first.name}. మీరు ${first.subsidy} పొందవచ్చు। అర్హత ${first.eligibility}. దరఖాస్తు ప్రక్రియను వివరించాలా?`;
            },
            'ta-IN': (schemes) => {
                if (schemes.length === 0) return "எனக்கு இப்போது பொருத்தமான திட்டங்கள் கிடைக்கவில்லை. நான் பின்னர் மீண்டும் முயற்சிப்பேன்।";
                const first = schemes[0];
                return `அருமை! உங்களுக்காக ${schemes.length} சிறந்த திட்டங்களைக் கண்டுபிடித்தேன். சிறந்தது ${first.name}. நீங்கள் ${first.subsidy} பெறலாம். தகுதி ${first.eligibility}. விண்ணப்ப செயல்முறையை விளக்க வேண்டுமா?`;
            }
        },
        rights: {
            'en-IN': (rights) => {
                if (rights.length === 0) return "I couldn't find specific rights information right now. Please try again later.";
                const first = rights[0];
                return `Here are your rights. You have the ${first.title}. ${first.description} The legal basis is ${first.legalBasis}. Would you like me to explain how to exercise this right?`;
            },
            'hi-IN': (rights) => {
                if (rights.length === 0) return "मुझे अभी विशिष्ट अधिकार की जानकारी नहीं मिली। कृपया बाद में फिर कोशिश करें।";
                const first = rights[0];
                return `यहां आपके अधिकार हैं। आपके पास ${first.title} है। ${first.description} कानूनी आधार है ${first.legalBasis}। क्या आप चाहते हैं कि मैं बताऊं कि इस अधिकार का उपयोग कैसे करें?`;
            },
            'te-IN': (rights) => {
                if (rights.length === 0) return "నాకు ప్రస్తుతం నిర్దిష్ట హక్కుల సమాచారం దొరకలేదు. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి।";
                const first = rights[0];
                return `ఇవి మీ హక్కులు. మీకు ${first.title} ఉంది। ${first.description} చట్టపరమైన ఆధారం ${first.legalBasis}. ఈ హక్కును ఎలా వినియోగించాలో వివరించాలా?`;
            },
            'ta-IN': (rights) => {
                if (rights.length === 0) return "எனக்கு இப்போது குறிப்பிட்ட உரிமைகள் தகவல் கிடைக்கவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.";
                const first = rights[0];
                return `இவை உங்கள் உரிமைகள். உங்களுக்கு ${first.title} உள்ளது। ${first.description} சட்ட அடிப்படை ${first.legalBasis}. இந்த உரிமையை எவ்வாறு பயன்படுத்துவது என்பதை விளக்க வேண்டுமா?`;
            }
        }
    };
    
    const responseGenerator = responses[type]?.[language] || responses[type]['en-IN'];
    return responseGenerator ? responseGenerator(data) : "I'm processing your request. Please wait.";
};