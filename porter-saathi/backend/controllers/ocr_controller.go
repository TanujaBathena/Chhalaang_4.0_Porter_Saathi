package controllers

import (
	"encoding/base64"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// OCRRequest represents the request structure for OCR processing
type OCRRequest struct {
	ImageData string `json:"imageData" binding:"required"`
	ImageType string `json:"imageType"`
}

// OCRResponse represents the response structure for OCR processing
type OCRResponse struct {
	Success       bool                   `json:"success"`
	Message       string                 `json:"message"`
	ExtractedData map[string]interface{} `json:"extractedData,omitempty"`
	Confidence    int                    `json:"confidence,omitempty"`
	RawText       string                 `json:"rawText,omitempty"`
}

// AadhaarPatterns contains regex patterns for extracting Aadhaar information
var AadhaarPatterns = map[string]*regexp.Regexp{
	"aadhaarNumber": regexp.MustCompile(`\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b`),
	"name":          regexp.MustCompile(`(?i)(?:Name[:\s]*|नाम[:\s]*|పేరు[:\s]*|பெயர்[:\s]*)([A-Za-z\s]{2,50})`),
	"dateOfBirth":   regexp.MustCompile(`(?i)(?:DOB[:\s]*|Date of Birth[:\s]*|जन्म तिथि[:\s]*|జన్మ తేదీ[:\s]*|பிறந்த தேதி[:\s]*)(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})`),
	"gender":        regexp.MustCompile(`(?i)(?:Gender[:\s]*|Sex[:\s]*|लिंग[:\s]*|లింగం[:\s]*|பாலினம்[:\s]*)(Male|Female|पुरुष|महिला|పురుషుడు|స్త్రీ|ஆண்|பெண்)`),
	"mobile":        regexp.MustCompile(`(?i)(?:Mobile[:\s]*|Phone[:\s]*|मोबाइल[:\s]*|మొబైల్[:\s]*|மொபைல்[:\s]*)(\d{10})`),
}

// ProcessAadhaarOCR handles OCR processing of Aadhaar card images
func ProcessAadhaarOCR(c *gin.Context) {
	var request OCRRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, OCRResponse{
			Success: false,
			Message: "Invalid request format: " + err.Error(),
		})
		return
	}

	// Validate base64 image data
	if !strings.HasPrefix(request.ImageData, "data:image/") {
		c.JSON(http.StatusBadRequest, OCRResponse{
			Success: false,
			Message: "Invalid image data format. Expected base64 encoded image.",
		})
		return
	}

	// Extract base64 data
	parts := strings.Split(request.ImageData, ",")
	if len(parts) != 2 {
		c.JSON(http.StatusBadRequest, OCRResponse{
			Success: false,
			Message: "Invalid base64 image format.",
		})
		return
	}

	// Decode base64 image data
	imageBytes, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, OCRResponse{
			Success: false,
			Message: "Failed to decode image data: " + err.Error(),
		})
		return
	}

	// Validate image size (max 5MB)
	if len(imageBytes) > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, OCRResponse{
			Success: false,
			Message: "Image size too large. Maximum allowed size is 5MB.",
		})
		return
	}

	// Note: In a real implementation, you would use an OCR service here
	// For now, we'll simulate OCR processing with mock data
	// You could integrate with services like Google Cloud Vision API, AWS Textract, etc.

	// Simulate OCR processing delay
	// time.Sleep(2 * time.Second)

	// Mock extracted text (in real implementation, this would come from OCR service)
	mockText := simulateOCRText()

	// Extract information from the mock text
	extractedData := extractAadhaarInfo(mockText)

	// Calculate confidence score
	confidence := calculateConfidence(extractedData)

	c.JSON(http.StatusOK, OCRResponse{
		Success:       true,
		Message:       "OCR processing completed successfully",
		ExtractedData: extractedData,
		Confidence:    confidence,
		RawText:       mockText,
	})
}

// simulateOCRText returns mock OCR text for demonstration
func simulateOCRText() string {
	return `GOVERNMENT OF INDIA
	आधार
	Name: RAJESH KUMAR SHARMA
	नाम: राजेश कुमार शर्मा
	DOB: 15/08/1985
	जन्म तिथि: 15/08/1985
	Gender: Male
	लिंग: पुरुष
	1234 5678 9012
	Address: 123 Main Street, New Delhi, Delhi - 110001
	पता: 123 मेन स्ट्रीट, नई दिल्ली, दिल्ली - 110001`
}

// extractAadhaarInfo extracts structured information from OCR text
func extractAadhaarInfo(text string) map[string]interface{} {
	data := make(map[string]interface{})

	// Clean text
	cleanText := strings.ReplaceAll(text, "\n", " ")
	cleanText = regexp.MustCompile(`\s+`).ReplaceAllString(cleanText, " ")
	cleanText = strings.TrimSpace(cleanText)

	// Extract Aadhaar number
	if match := AadhaarPatterns["aadhaarNumber"].FindString(cleanText); match != "" {
		// Clean the Aadhaar number
		aadhaarNumber := regexp.MustCompile(`[\s-]`).ReplaceAllString(match, "")
		data["aadhaarNumber"] = aadhaarNumber
	}

	// Extract name
	if matches := AadhaarPatterns["name"].FindStringSubmatch(cleanText); len(matches) > 1 {
		name := strings.TrimSpace(matches[1])
		name = regexp.MustCompile(`\s+`).ReplaceAllString(name, " ")
		data["name"] = name
	}

	// Extract date of birth
	if matches := AadhaarPatterns["dateOfBirth"].FindStringSubmatch(cleanText); len(matches) > 1 {
		data["dateOfBirth"] = matches[1]
	}

	// Extract gender
	if matches := AadhaarPatterns["gender"].FindStringSubmatch(cleanText); len(matches) > 1 {
		gender := strings.ToLower(matches[1])
		if strings.Contains(gender, "male") || strings.Contains(gender, "पुरुष") {
			data["gender"] = "Male"
		} else if strings.Contains(gender, "female") || strings.Contains(gender, "महिला") {
			data["gender"] = "Female"
		}
	}

	// Extract mobile number
	if matches := AadhaarPatterns["mobile"].FindStringSubmatch(cleanText); len(matches) > 1 {
		data["mobileNumber"] = matches[1]
	}

	// Extract address (simplified)
	addressPattern := regexp.MustCompile(`(?i)(?:Address[:\s]*|पता[:\s]*)([A-Za-z0-9\s,.-]{10,200})`)
	if matches := addressPattern.FindStringSubmatch(cleanText); len(matches) > 1 {
		address := strings.TrimSpace(matches[1])
		// Clean up address
		address = regexp.MustCompile(`\s+`).ReplaceAllString(address, " ")
		data["address"] = address
	}

	return data
}

// calculateConfidence calculates confidence score based on extracted data
func calculateConfidence(data map[string]interface{}) int {
	score := 0
	maxScore := 0

	// Aadhaar number (most important)
	maxScore += 40
	if aadhaar, ok := data["aadhaarNumber"].(string); ok && len(aadhaar) == 12 {
		score += 40
	}

	// Name
	maxScore += 20
	if name, ok := data["name"].(string); ok && len(name) >= 2 {
		score += 20
	}

	// Date of birth
	maxScore += 15
	if _, ok := data["dateOfBirth"]; ok {
		score += 15
	}

	// Gender
	maxScore += 10
	if _, ok := data["gender"]; ok {
		score += 10
	}

	// Address
	maxScore += 10
	if _, ok := data["address"]; ok {
		score += 10
	}

	// Mobile number
	maxScore += 5
	if _, ok := data["mobileNumber"]; ok {
		score += 5
	}

	if maxScore == 0 {
		return 0
	}

	return (score * 100) / maxScore
}

// GetOCRStatus returns the status of OCR service
func GetOCRStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "active",
		"message": "OCR service is running",
		"version": "1.0.0",
		"supportedFormats": []string{
			"image/jpeg",
			"image/png",
			"image/jpg",
		},
		"maxFileSize": "5MB",
		"features": []string{
			"Aadhaar card text extraction",
			"Multi-language support (English, Hindi)",
			"Confidence scoring",
			"Data validation",
		},
	})
}
