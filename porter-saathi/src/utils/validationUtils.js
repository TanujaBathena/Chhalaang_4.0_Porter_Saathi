// Validation utilities for the Porter Saathi app

export const validateMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile);
};

export const validateOTP = (otpValue) => {
    return /^\d{6}$/.test(otpValue);
};

export const validateAadhar = (aadharNumber) => {
    // Aadhar number should be 12 digits
    return /^\d{12}$/.test(aadharNumber.replace(/\s/g, ''));
};

export const validateLicense = (licenseNumber) => {
    // Indian driving license format: 2 letters, 2 digits, year (4 digits), 7 digits
    return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(licenseNumber.replace(/\s/g, ''));
};

export const validateVehicleNumber = (vehicleNumber) => {
    // Indian vehicle number format: 2 letters, 2 digits, 2 letters, 4 digits
    return /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(vehicleNumber.replace(/\s/g, ''));
};

export const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
};

export const validateFile = (file, type) => {
    if (!file) return false;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
}; 