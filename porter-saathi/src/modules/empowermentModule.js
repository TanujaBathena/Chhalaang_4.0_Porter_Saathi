/**
 * Empowerment Module for Porter Saathi
 * Handles government schemes advisor and driver rights & grievance redressal
 */

import { getGovernmentSchemes, getDriverRights, classifyIntent, generateVoiceResponse } from '../services/aiService';

/**
 * Government Schemes Handler
 * Processes queries about government schemes, loans, and subsidies
 */
export const governmentSchemesHandler = async (query, language = 'en-IN', onProgress = null) => {
    try {
        // Notify progress
        if (onProgress) onProgress('analyzing', 'Analyzing your request...');
        
        // Classify the intent
        const classification = classifyIntent(query, language);
        
        if (onProgress) onProgress('searching', 'Searching for relevant schemes...');
        
        // Get AI-powered schemes data
        const result = await getGovernmentSchemes(query, language, classification.intent);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        if (onProgress) onProgress('processing', 'Processing scheme information...');
        
        // Use AI-generated voice response or fallback
        const voiceResponse = result.voiceResponse || generateVoiceResponse(result.schemes, 'schemes', language);
        
        if (onProgress) onProgress('complete', 'Schemes found successfully!');
        
        return {
            success: true,
            type: 'schemes',
            schemes: result.schemes,
            totalFound: result.totalFound,
            voiceResponse: voiceResponse,
            classification: classification,
            language: language,
            query: query
        };
        
    } catch (error) {
        console.error('Government Schemes Handler Error:', error);
        
        const errorMessages = {
            'en-IN': 'Sorry, I could not find scheme information right now. Please try again later.',
            'hi-IN': 'क्षमा करें, मुझे अभी योजना की जानकारी नहीं मिल सकी। कृपया बाद में फिर कोशिश करें।',
            'te-IN': 'క్షమించండి, నేను ప్రస్తుతం పథక సమాచారాన్ని కనుగొనలేకపోయాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.',
            'ta-IN': 'மன்னிக்கவும், என்னால் இப்போது திட்ட தகவலைக் கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.'
        };
        
        return {
            success: false,
            type: 'schemes',
            error: error.message,
            voiceResponse: errorMessages[language] || errorMessages['en-IN'],
            schemes: []
        };
    }
};

/**
 * Driver Rights Handler
 * Processes queries about driver rights, legal issues, and grievance redressal
 */
export const driverRightsHandler = async (query, language = 'en-IN', onProgress = null) => {
    try {
        // Notify progress
        if (onProgress) onProgress('analyzing', 'Analyzing your legal query...');
        
        // Classify the grievance type
        const classification = classifyIntent(query, language);
        
        if (onProgress) onProgress('searching', 'Looking up your rights...');
        
        // Get AI-powered rights data
        const result = await getDriverRights(query, language, classification.grievanceType);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        if (onProgress) onProgress('processing', 'Processing legal information...');
        
        // Use AI-generated voice response or fallback
        const voiceResponse = result.voiceResponse || generateVoiceResponse(result.rights, 'rights', language);
        
        if (onProgress) onProgress('complete', 'Rights information found!');
        
        return {
            success: true,
            type: 'rights',
            rights: result.rights,
            totalFound: result.totalFound,
            voiceResponse: voiceResponse,
            classification: classification,
            language: language,
            query: query
        };
        
    } catch (error) {
        console.error('Driver Rights Handler Error:', error);
        
        const errorMessages = {
            'en-IN': 'Sorry, I could not find rights information right now. Please try again later.',
            'hi-IN': 'क्षमा करें, मुझे अभी अधिकार की जानकारी नहीं मिल सकी। कृपया बाद में फिर कोशिश करें।',
            'te-IN': 'క్షమించండి, నేను ప్రస్తుతం హక్కుల సమాచారాన్ని కనుగొనలేకపోయాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.',
            'ta-IN': 'மன்னிக்கவும், என்னால் இப்போது உரிமைகள் தகவலைக் கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.'
        };
        
        return {
            success: false,
            type: 'rights',
            error: error.message,
            voiceResponse: errorMessages[language] || errorMessages['en-IN'],
            rights: []
        };
    }
};

/**
 * Main Empowerment Module Handler
 * Routes queries to appropriate handlers based on intent classification
 */
export const processEmpowermentQuery = async (query, language = 'en-IN', onProgress = null) => {
    try {
        // Classify the overall intent
        const classification = classifyIntent(query, language);
        
        if (classification.type === 'schemes') {
            return await governmentSchemesHandler(query, language, onProgress);
        } else if (classification.type === 'rights') {
            return await driverRightsHandler(query, language, onProgress);
        } else {
            // Unknown intent - try both and return the most relevant
            if (onProgress) onProgress('analyzing', 'Understanding your query...');
            
            const [schemesResult, rightsResult] = await Promise.all([
                governmentSchemesHandler(query, language),
                driverRightsHandler(query, language)
            ]);
            
            // Return the one with higher confidence or more results
            if (schemesResult.success && schemesResult.schemes.length > 0) {
                return schemesResult;
            } else if (rightsResult.success && rightsResult.rights.length > 0) {
                return rightsResult;
            } else {
                throw new Error('Could not understand your query');
            }
        }
        
    } catch (error) {
        console.error('Empowerment Module Error:', error);
        
        const fallbackMessages = {
            'en-IN': 'I could not understand your query completely. Please try asking about government schemes for vehicle upgrade or your rights regarding traffic fines.',
            'hi-IN': 'मैं आपका प्रश्न पूरी तरह से समझ नहीं सका। कृपया वाहन अपग्रेड के लिए सरकारी योजनाओं या ट्रैफिक फाइन के संबंध में अपने अधिकारों के बारे में पूछने की कोशिश करें।',
            'te-IN': 'నేను మీ ప్రశ్నను పూర్తిగా అర్థం చేసుకోలేకపోయాను. దయచేసి వాహన అప్‌గ్రేడ్ కోసం ప్రభుత్వ పథకాలు లేదా ట్రాఫిక్ ఫైన్‌లకు సంబంధించి మీ హక్కుల గురించి అడగండి.',
            'ta-IN': 'உங்கள் கேள்வியை என்னால் முழுமையாக புரிந்து கொள்ள முடியவில்லை. தயவுசெய்து வாகன மேம்படுத்தலுக்கான அரசு திட்டங்கள் அல்லது போக்குவரத்து அபராதம் தொடர்பான உங்கள் உரிமைகள் பற்றி கேட்க முயற்சிக்கவும்.'
        };
        
        return {
            success: false,
            type: 'unknown',
            error: error.message,
            voiceResponse: fallbackMessages[language] || fallbackMessages['en-IN'],
            suggestions: [
                'Ask about government schemes for vehicle upgrade',
                'Ask about your rights regarding traffic fines',
                'Ask about payment disputes with customers'
            ]
        };
    }
};

/**
 * Get quick action suggestions based on language
 */
export const getQuickActions = (language = 'en-IN') => {
    const actions = {
        'en-IN': [
            { id: 'vehicle_upgrade', text: 'Vehicle upgrade schemes', query: 'I want to upgrade my small truck to a bigger truck' },
            { id: 'business_loan', text: 'Business loan schemes', query: 'I need a loan for my transport business' },
            { id: 'traffic_fine', text: 'Contest traffic fine', query: 'Police officer gave me wrong fine' },
            { id: 'payment_dispute', text: 'Payment dispute help', query: 'Customer is not paying my money' }
        ],
        'hi-IN': [
            { id: 'vehicle_upgrade', text: 'वाहन अपग्रेड योजनाएं', query: 'मुझे अपना छोटा ट्रक बड़ा ट्रक लेना है' },
            { id: 'business_loan', text: 'व्यापार लोन योजनाएं', query: 'मुझे अपने परिवहन व्यापार के लिए लोन चाहिए' },
            { id: 'traffic_fine', text: 'ट्रैफिक फाइन का विरोध', query: 'पुलिस अधिकारी ने मुझे गलत फाइन लगाया' },
            { id: 'payment_dispute', text: 'भुगतान विवाद सहायता', query: 'ग्राहक मेरा पैसा नहीं दे रहा' }
        ],
        'te-IN': [
            { id: 'vehicle_upgrade', text: 'వాహన అప్‌గ్రేడ్ పథకాలు', query: 'నేను నా చిన్న ట్రక్‌ను పెద్ద ట్రక్‌గా మార్చుకోవాలి' },
            { id: 'business_loan', text: 'వ్యాపార రుణ పథకాలు', query: 'నా రవాణా వ్యాపారం కోసం రుణం కావాలి' },
            { id: 'traffic_fine', text: 'ట్రాఫిక్ ఫైన్ వ్యతిరేకత', query: 'పోలీస్ అధికారి నాకు తప్పు ఫైన్ వేశారు' },
            { id: 'payment_dispute', text: 'చెల్లింపు వివాద సహాయం', query: 'కస్టమర్ నా డబ్బు ఇవ్వడం లేదు' }
        ],
        'ta-IN': [
            { id: 'vehicle_upgrade', text: 'வாகன மேம்படுத்தல் திட்டங்கள்', query: 'என் சிறிய டிரக்கை பெரிய டிரக்காக மாற்ற வேண்டும்' },
            { id: 'business_loan', text: 'வணிக கடன் திட்டங்கள்', query: 'என் போக்குவரத்து வணிகத்திற்கு கடன் வேண்டும்' },
            { id: 'traffic_fine', text: 'போக்குவரத்து அபராத எதிர்ப்பு', query: 'போலீஸ் அதிகாரி எனக்கு தவறான அபராதம் விதித்தார்' },
            { id: 'payment_dispute', text: 'பணம் செலுத்தும் சர்ச்சை உதவி', query: 'வாடிக்கையாளர் என் பணத்தை கொடுக்கவில்லை' }
        ]
    };
    
    return actions[language] || actions['en-IN'];
};
