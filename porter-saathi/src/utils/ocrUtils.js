import Tesseract from 'tesseract.js';

/**
 * OCR Utility functions for extracting text from Aadhaar card images
 */

// Regular expressions for extracting document information
const DOCUMENT_PATTERNS = {
    // Aadhaar patterns
    // Aadhaar number pattern: 12 digits with optional spaces/hyphens
    aadhaarNumber: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    
    // Name patterns - typically appears after "Name:" or similar labels
    name: /(?:Name[:\s]*|नाम[:\s]*|పేరు[:\s]*|பெயர்[:\s]*)([A-Za-z\s]{2,50})/i,
    
    // Date of birth patterns
    dateOfBirth: /(?:DOB[:\s]*|Date of Birth[:\s]*|जन्म तिथि[:\s]*|జన్మ తేదీ[:\s]*|பிறந்த தேதி[:\s]*)(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    
    // Gender patterns
    gender: /(?:Gender[:\s]*|Sex[:\s]*|लिंग[:\s]*|లింగం[:\s]*|பாலினம்[:\s]*)(Male|Female|पुरुष|महिला|పురుషుడు|స్త్రీ|ஆண்|பெண்)/i,
    
    // Address patterns - more complex, usually multiple lines
    address: /(?:Address[:\s]*|पता[:\s]*|చిరునామా[:\s]*|முகவரி[:\s]*)([A-Za-z0-9\s,.-]{10,200})/i,
    
    // Father's name patterns
    fatherName: /(?:Father[:\s]*|Father's Name[:\s]*|पिता का नाम[:\s]*|తండ్రి పేరు[:\s]*|தந்தையின் பெயர்[:\s]*)([A-Za-z\s]{2,50})/i,
    
    // Mobile number patterns (if present)
    mobile: /(?:Mobile[:\s]*|Phone[:\s]*|मोबाइल[:\s]*|మొబైల్[:\s]*|மொபைல்[:\s]*)(\d{10})/i,
    
    // Driving License patterns - Updated for better Indian DL detection
    licenseNumber: /(?:DL[:\s]*|License[:\s]*|Licence[:\s]*|DL No[:\s]*|लाइसेंस[:\s]*|లైసెన్స్[:\s]*|உரிமம்[:\s]*|DRIVING[:\s]*LICENCE[:\s]*|ड्राइविंग[:\s]*लाइसेंस[:\s]*)([A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}|[A-Z]{2}-?[0-9]{2}-?[0-9]{4}-?[0-9]{7}|[A-Z]{2}[0-9]{13}|[A-Z]{2}-[0-9]{13})/i,
    licenseValidity: /(?:Valid[:\s]*|Validity[:\s]*|Valid Till[:\s]*|वैधता[:\s]*|చెల్లుబాటు[:\s]*|செல்லுபடியாகும்[:\s]*)(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    licenseIssueDate: /(?:Issue[:\s]*|Issued[:\s]*|DOI[:\s]*|जारी[:\s]*|జారీ[:\s]*|வழங்கப்பட்ட[:\s]*)(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    licenseClass: /(?:Class[:\s]*|Vehicle Class[:\s]*|वर्ग[:\s]*|వర్గం[:\s]*|வகுப்பு[:\s]*)(LMV|HMV|MCWG|MCWOG|LMV-NT|HMV-NT)/i,
    
    // Vehicle RC patterns - Updated for better Indian vehicle number detection
    vehicleNumber: /(?:Registration[:\s]*|Reg[:\s]*|Vehicle[:\s]*|पंजीकरण[:\s]*|నమోదు[:\s]*|பதிவு[:\s]*|REGN[:\s]*NO[:\s]*|रजि[:\s]*नं[:\s]*|REG[:\s]*NO[:\s]*)([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}|[A-Z]{2}-?[0-9]{1,2}-?[A-Z]{1,3}-?[0-9]{1,4})/i,
    vehicleModel: /(?:Model[:\s]*|Make[:\s]*|मॉडल[:\s]*|మోడల్[:\s]*|மாடல்[:\s]*)([A-Za-z0-9\s]{2,30})/i,
    vehicleYear: /(?:Year[:\s]*|Mfg[:\s]*|Manufacturing[:\s]*|वर्ष[:\s]*|సంవత్సరం[:\s]*|ஆண்டு[:\s]*)(\d{4})/i,
    engineNumber: /(?:Engine[:\s]*|Engine No[:\s]*|इंजन[:\s]*|ఇంజిన్[:\s]*|இயந்திரம்[:\s]*)([A-Z0-9]{6,20})/i,
    chassisNumber: /(?:Chassis[:\s]*|Chassis No[:\s]*|चेसिस[:\s]*|చాసిస్[:\s]*|சேஸிஸ்[:\s]*)([A-Z0-9]{17})/i,
    
    // Common patterns for all documents
    fatherName: /(?:Father[:\s]*|Father's Name[:\s]*|पिता का नाम[:\s]*|తండ్రి పేరు[:\s]*|தந்தையின் பெயர்[:\s]*)([A-Za-z\s]{2,50})/i,
    address: /(?:Address[:\s]*|पता[:\s]*|చిరునామా[:\s]*|முகவரி[:\s]*)([A-Za-z0-9\s,.-]{10,200})/i
};

/**
 * Extract text from image using Tesseract OCR
 * @param {File|string} imageFile - Image file or image URL
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (imageFile, onProgress = null) => {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'eng+hin', // English and Hindi languages
            {
                logger: onProgress ? (m) => {
                    if (m.status === 'recognizing text') {
                        onProgress(Math.round(m.progress * 100));
                    }
                } : undefined,
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:-/',
                tessedit_pageseg_mode: Tesseract.PSM.AUTO
            }
        );
        
        return result.data.text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to extract text from image. Please ensure the image is clear and try again.');
    }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
export const cleanOCRText = (text) => {
    return text
        .replace(/\n+/g, ' ') // Replace multiple newlines with space
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
};

/**
 * Extract Aadhaar number from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted Aadhaar number or null
 */
export const extractAadhaarNumber = (text) => {
    const matches = text.match(DOCUMENT_PATTERNS.aadhaarNumber);
    if (matches && matches.length > 0) {
        // Clean the Aadhaar number by removing spaces and hyphens
        return matches[0].replace(/[\s-]/g, '');
    }
    return null;
};

/**
 * Extract name from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted name or null
 */
export const extractName = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.name);
    if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
    }
    
    // Fallback: Look for capitalized words that might be names
    const words = text.split(/\s+/);
    const capitalizedWords = words.filter(word => 
        /^[A-Z][a-z]+$/.test(word) && word.length > 2
    );
    
    if (capitalizedWords.length >= 2) {
        return capitalizedWords.slice(0, 3).join(' '); // Take first 3 capitalized words
    }
    
    return null;
};

/**
 * Extract date of birth from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted date of birth or null
 */
export const extractDateOfBirth = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.dateOfBirth);
    if (match && match[1]) {
        return match[1];
    }
    
    // Look for any date pattern in the text
    const datePattern = /\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/g;
    const dates = text.match(datePattern);
    if (dates && dates.length > 0) {
        return dates[0];
    }
    
    return null;
};

/**
 * Extract gender from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted gender or null
 */
export const extractGender = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.gender);
    if (match && match[1]) {
        const gender = match[1].toLowerCase();
        if (gender.includes('male') || gender.includes('पुरुष') || gender.includes('పురుషుడు') || gender.includes('ஆண்')) {
            return 'Male';
        } else if (gender.includes('female') || gender.includes('महिला') || gender.includes('స్త్రీ') || gender.includes('பெண்')) {
            return 'Female';
        }
    }
    return null;
};

/**
 * Extract address from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted address or null
 */
export const extractAddress = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.address);
    if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
    }
    
    // Fallback: Look for lines that might contain address information
    const lines = text.split('\n').filter(line => line.trim().length > 10);
    const addressLines = lines.filter(line => 
        /[A-Za-z0-9\s,.-]{10,}/.test(line) && 
        !/\b\d{4}\s?\d{4}\s?\d{4}\b/.test(line) // Exclude lines with Aadhaar numbers
    );
    
    if (addressLines.length > 0) {
        return addressLines.slice(0, 2).join(', ').trim();
    }
    
    return null;
};

/**
 * Extract father's name from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted father's name or null
 */
export const extractFatherName = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.fatherName);
    if (match && match[1]) {
        return match[1].trim().replace(/\s+/g, ' ');
    }
    return null;
};

/**
 * Extract mobile number from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted mobile number or null
 */
export const extractMobileNumber = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.mobile);
    if (match && match[1]) {
        return match[1];
    }
    
    // Look for any 10-digit number
    const mobilePattern = /\b\d{10}\b/g;
    const mobiles = text.match(mobilePattern);
    if (mobiles && mobiles.length > 0) {
        return mobiles[0];
    }
    
    return null;
};

/**
 * Extract driving license number from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted license number or null
 */
export const extractLicenseNumber = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.licenseNumber);
    if (match && match[1]) {
        return match[1].trim().toUpperCase().replace(/[-\s]/g, '');
    }
    
    // Fallback patterns for Indian driving licenses
    const fallbackPatterns = [
        /\b[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}\b/g,  // Standard format: XX0020040007
        /\b[A-Z]{2}-?[0-9]{2}-?[0-9]{4}-?[0-9]{7}\b/g,  // With separators
        /\b[A-Z]{2}[0-9]{13}\b/g,  // Alternative format
        /\b[A-Z]{2}\s?[0-9]{2}\s?[0-9]{4}\s?[0-9]{7}\b/g  // With spaces
    ];
    
    for (const pattern of fallbackPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            return matches[0].replace(/[-\s]/g, '').toUpperCase();
        }
    }
    
    return null;
};

/**
 * Extract license validity date from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted validity date or null
 */
export const extractLicenseValidity = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.licenseValidity);
    if (match && match[1]) {
        return match[1];
    }
    return null;
};

/**
 * Extract vehicle registration number from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted vehicle number or null
 */
export const extractVehicleNumber = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.vehicleNumber);
    if (match && match[1]) {
        return match[1].trim().toUpperCase().replace(/[-\s]/g, '');
    }
    
    // Fallback patterns for Indian vehicle numbers
    const fallbackPatterns = [
        /\b[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}\b/g,  // Standard: XX00XX0000
        /\b[A-Z]{2}-?[0-9]{1,2}-?[A-Z]{1,3}-?[0-9]{1,4}\b/g,  // With separators
        /\b[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{1,4}\b/g,  // With spaces
        /\b[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}\b/g  // Specific format
    ];
    
    for (const pattern of fallbackPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            return matches[0].replace(/[-\s]/g, '').toUpperCase();
        }
    }
    
    return null;
};

/**
 * Extract vehicle model from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted vehicle model or null
 */
export const extractVehicleModel = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.vehicleModel);
    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
};

/**
 * Extract engine number from text
 * @param {string} text - OCR extracted text
 * @returns {string|null} - Extracted engine number or null
 */
export const extractEngineNumber = (text) => {
    const match = text.match(DOCUMENT_PATTERNS.engineNumber);
    if (match && match[1]) {
        return match[1].trim().toUpperCase();
    }
    return null;
};

/**
 * Process driving license image and extract relevant information
 * @param {File} imageFile - Driving license image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Extracted license information
 */
export const processDrivingLicense = async (imageFile, onProgress = null) => {
    try {
        const rawText = await extractTextFromImage(imageFile, onProgress);
        const cleanedText = cleanOCRText(rawText);
        
        console.log('License OCR Raw Text:', rawText);
        console.log('License OCR Cleaned Text:', cleanedText);
        
        const extractedData = {
            licenseNumber: extractLicenseNumber(cleanedText),
            name: extractName(cleanedText),
            fatherName: extractFatherName(cleanedText),
            dateOfBirth: extractDateOfBirth(cleanedText),
            address: extractAddress(cleanedText),
            validity: extractLicenseValidity(cleanedText),
            rawText: rawText,
            cleanedText: cleanedText
        };
        
        console.log('Extracted License Data:', extractedData);
        return extractedData;
    } catch (error) {
        console.error('License processing error:', error);
        throw error;
    }
};

/**
 * Process vehicle RC image and extract relevant information
 * @param {File} imageFile - Vehicle RC image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Extracted vehicle information
 */
export const processVehicleRC = async (imageFile, onProgress = null) => {
    try {
        const rawText = await extractTextFromImage(imageFile, onProgress);
        const cleanedText = cleanOCRText(rawText);
        
        console.log('Vehicle RC OCR Raw Text:', rawText);
        console.log('Vehicle RC OCR Cleaned Text:', cleanedText);
        
        const extractedData = {
            vehicleNumber: extractVehicleNumber(cleanedText),
            ownerName: extractName(cleanedText),
            vehicleModel: extractVehicleModel(cleanedText),
            engineNumber: extractEngineNumber(cleanedText),
            address: extractAddress(cleanedText),
            rawText: rawText,
            cleanedText: cleanedText
        };
        
        console.log('Extracted Vehicle RC Data:', extractedData);
        return extractedData;
    } catch (error) {
        console.error('Vehicle RC processing error:', error);
        throw error;
    }
};

/**
 * Process document based on type
 * @param {File} imageFile - Document image file
 * @param {string} documentType - Type of document ('aadhaar', 'license', 'vehicle')
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Extracted document information
 */
export const processDocument = async (imageFile, documentType, onProgress = null) => {
    switch (documentType.toLowerCase()) {
        case 'aadhaar':
        case 'aadhar':
            return await processAadhaarCard(imageFile, onProgress);
        case 'license':
        case 'driving_license':
            return await processDrivingLicense(imageFile, onProgress);
        case 'vehicle':
        case 'rc':
        case 'vehicle_rc':
            return await processVehicleRC(imageFile, onProgress);
        default:
            throw new Error(`Unsupported document type: ${documentType}`);
    }
};

/**
 * Process Aadhaar card image and extract all relevant information
 * @param {File} imageFile - Aadhaar card image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Extracted Aadhaar information
 */
export const processAadhaarCard = async (imageFile, onProgress = null) => {
    try {
        // Extract text from image
        const rawText = await extractTextFromImage(imageFile, onProgress);
        const cleanedText = cleanOCRText(rawText);
        
        console.log('OCR Raw Text:', rawText);
        console.log('OCR Cleaned Text:', cleanedText);
        
        // Extract individual fields
        const extractedData = {
            aadhaarNumber: extractAadhaarNumber(cleanedText),
            name: extractName(cleanedText),
            dateOfBirth: extractDateOfBirth(cleanedText),
            gender: extractGender(cleanedText),
            address: extractAddress(cleanedText),
            fatherName: extractFatherName(cleanedText),
            mobileNumber: extractMobileNumber(cleanedText),
            rawText: rawText,
            cleanedText: cleanedText
        };
        
        console.log('Extracted Aadhaar Data:', extractedData);
        
        return extractedData;
    } catch (error) {
        console.error('Aadhaar processing error:', error);
        throw error;
    }
};

/**
 * Validate extracted Aadhaar data
 * @param {Object} data - Extracted Aadhaar data
 * @returns {Object} - Validation results
 */
export const validateExtractedData = (data) => {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Validate Aadhaar number
    if (!data.aadhaarNumber) {
        validation.errors.push('Aadhaar number not found in the image');
        validation.isValid = false;
    } else if (!/^\d{12}$/.test(data.aadhaarNumber)) {
        validation.errors.push('Invalid Aadhaar number format');
        validation.isValid = false;
    }
    
    // Validate name
    if (!data.name) {
        validation.warnings.push('Name not clearly detected');
    } else if (data.name.length < 2) {
        validation.warnings.push('Name seems too short');
    }
    
    // Check for minimum required data
    const requiredFields = ['aadhaarNumber'];
    const missingRequired = requiredFields.filter(field => !data[field]);
    
    if (missingRequired.length > 0) {
        validation.errors.push(`Missing required fields: ${missingRequired.join(', ')}`);
        validation.isValid = false;
    }
    
    return validation;
};

/**
 * Get confidence score for extracted data
 * @param {Object} data - Extracted Aadhaar data
 * @returns {number} - Confidence score (0-100)
 */
export const getConfidenceScore = (data) => {
    let score = 0;
    let maxScore = 0;
    
    // Aadhaar number (most important)
    maxScore += 40;
    if (data.aadhaarNumber && /^\d{12}$/.test(data.aadhaarNumber)) {
        score += 40;
    }
    
    // Name
    maxScore += 20;
    if (data.name && data.name.length >= 2) {
        score += 20;
    }
    
    // Date of birth
    maxScore += 15;
    if (data.dateOfBirth) {
        score += 15;
    }
    
    // Gender
    maxScore += 10;
    if (data.gender) {
        score += 10;
    }
    
    // Address
    maxScore += 10;
    if (data.address) {
        score += 10;
    }
    
    // Father's name
    maxScore += 5;
    if (data.fatherName) {
        score += 5;
    }
    
    return Math.round((score / maxScore) * 100);
};
