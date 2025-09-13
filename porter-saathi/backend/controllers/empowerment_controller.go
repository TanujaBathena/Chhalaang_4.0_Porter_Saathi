package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"time"
)

// EmpowermentQuery represents a user query for empowerment services
type EmpowermentQuery struct {
	Query    string `json:"query" binding:"required"`
	Language string `json:"language"`
	Type     string `json:"type"` // "schemes" or "rights"
}

// SchemeResponse represents a government scheme
type SchemeResponse struct {
	Name               string   `json:"name"`
	Description        string   `json:"description"`
	Subsidy            string   `json:"subsidy"`
	Eligibility        string   `json:"eligibility"`
	ProcessingTime     string   `json:"processingTime"`
	Contact            string   `json:"contact"`
	Documents          []string `json:"documents"`
	ApplicationProcess string   `json:"applicationProcess"`
}

// RightResponse represents a driver right
type RightResponse struct {
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	LegalBasis     string   `json:"legalBasis"`
	HowToExercise  []string `json:"howToExercise"`
	ContactForHelp []string `json:"contactForHelp"`
}

// EmpowermentResponse represents the API response
type EmpowermentResponse struct {
	Success     bool             `json:"success"`
	Type        string           `json:"type"`
	Schemes     []SchemeResponse `json:"schemes,omitempty"`
	Rights      []RightResponse  `json:"rights,omitempty"`
	TotalFound  int              `json:"totalFound"`
	Language    string           `json:"language"`
	Query       string           `json:"query"`
	ProcessedAt time.Time        `json:"processedAt"`
}

// ProcessEmpowermentQuery handles empowerment-related queries
func ProcessEmpowermentQuery(c *gin.Context) {
	var query EmpowermentQuery

	if err := c.ShouldBindJSON(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
		})
		return
	}

	// Set default language if not provided
	if query.Language == "" {
		query.Language = "en-IN"
	}

	// Classify query type if not provided
	if query.Type == "" {
		query.Type = classifyQueryType(query.Query)
	}

	// Process based on type
	var response EmpowermentResponse

	switch query.Type {
	case "schemes":
		response = processSchemeQuery(query)
	case "rights":
		response = processRightsQuery(query)
	default:
		// Try both and return the most relevant
		schemesResp := processSchemeQuery(query)
		rightsResp := processRightsQuery(query)

		if len(schemesResp.Schemes) > 0 {
			response = schemesResp
		} else if len(rightsResp.Rights) > 0 {
			response = rightsResp
		} else {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"error":   "Could not understand your query",
				"suggestions": []string{
					"Ask about government schemes for vehicle upgrade",
					"Ask about your rights regarding traffic fines",
				},
			})
			return
		}
	}

	response.ProcessedAt = time.Now()
	c.JSON(http.StatusOK, response)
}

// classifyQueryType determines if query is about schemes or rights
func classifyQueryType(query string) string {
	queryLower := strings.ToLower(query)

	// Scheme keywords
	schemeKeywords := []string{
		"loan", "scheme", "upgrade", "truck", "vehicle", "business", "money", "finance", "subsidy",
		"लोन", "योजना", "अपग्रेड", "ट्रक", "वाहन", "व्यापार", "पैसा", "वित्त", "सब्सिडी",
		"లోన్", "పథకం", "అప్‌గ్రేడ్", "ట్రక్", "వాహనం", "వ్యాపారం", "డబ్బు", "ఫైనాన్స్",
		"கடன்", "திட்டம்", "மேம்படுத்தல்", "டிரக்", "வாகனம்", "வணிகம்", "பணம்", "நிதி",
	}

	// Rights keywords
	rightsKeywords := []string{
		"fine", "police", "challan", "payment", "customer", "dispute", "rights", "help", "problem",
		"फाइन", "पुलिस", "चालान", "भुगतान", "ग्राहक", "विवाद", "अधिकार", "मदद", "समस्या",
		"ఫైన్", "పోలీస్", "చలాన్", "చెల్లింపు", "కస్టమర్", "వివాదం", "హక్కులు", "సహాయం",
		"அபராதம்", "போலீஸ்", "சலான்", "பணம்", "வாடிக்கையாளர்", "சர்ச்சை", "உரிமைகள்", "உதவி",
	}

	hasSchemeKeywords := containsAny(queryLower, schemeKeywords)
	hasRightsKeywords := containsAny(queryLower, rightsKeywords)

	if hasSchemeKeywords && !hasRightsKeywords {
		return "schemes"
	} else if hasRightsKeywords && !hasSchemeKeywords {
		return "rights"
	}

	return "unknown"
}

// containsAny checks if string contains any of the keywords
func containsAny(text string, keywords []string) bool {
	for _, keyword := range keywords {
		if strings.Contains(text, keyword) {
			return true
		}
	}
	return false
}

// processSchemeQuery processes government scheme queries
func processSchemeQuery(query EmpowermentQuery) EmpowermentResponse {
	// Mock schemes data - In production, this would call actual AI/LLM service
	schemes := getMockSchemes(query.Language)

	return EmpowermentResponse{
		Success:    true,
		Type:       "schemes",
		Schemes:    schemes,
		TotalFound: len(schemes),
		Language:   query.Language,
		Query:      query.Query,
	}
}

// processRightsQuery processes driver rights queries
func processRightsQuery(query EmpowermentQuery) EmpowermentResponse {
	// Mock rights data - In production, this would call actual AI/LLM service
	rights := getMockRights(query.Language)

	return EmpowermentResponse{
		Success:    true,
		Type:       "rights",
		Rights:     rights,
		TotalFound: len(rights),
		Language:   query.Language,
		Query:      query.Query,
	}
}

// getMockSchemes returns mock scheme data based on language
func getMockSchemes(language string) []SchemeResponse {
	switch language {
	case "hi-IN":
		return []SchemeResponse{
			{
				Name:               "मुद्रा योजना - तरुण",
				Description:        "वाहन अपग्रेड और व्यापार विस्तार के लिए बिजनेस लोन",
				Subsidy:            "₹10 लाख तक का लोन सब्सिडी दर पर",
				Eligibility:        "छोटे परिवहन व्यापारी, मौजूदा वाहन मालिक",
				ProcessingTime:     "15-30 दिन",
				Contact:            "नजदीकी बैंक या मुद्रा पोर्टल",
				Documents:          []string{"आधार कार्ड", "वाहन RC", "व्यापार पंजीकरण", "आय प्रमाण"},
				ApplicationProcess: "बैंक जाएं → दस्तावेज जमा करें → लोन अप्रूवल → वाहन खरीदें",
			},
		}
	case "te-IN":
		return []SchemeResponse{
			{
				Name:               "ముద్రా యోజన - తరుణ్",
				Description:        "వాహన అప్‌గ్రేడ్ మరియు వ్యాపార విస్తరణ కోసం బిజినెస్ లోన్",
				Subsidy:            "₹10 లక్షల వరకు సబ్సిడీ రేటుతో లోన్",
				Eligibility:        "చిన్న రవాణా వ్యాపారులు, ప్రస్తుత వాహన యజమానులు",
				ProcessingTime:     "15-30 రోజులు",
				Contact:            "సమీప బ్యాంక్ లేదా ముద్రా పోర్టల్",
				Documents:          []string{"ఆధార్ కార్డ్", "వాహన RC", "వ్యాపార రిజిస్ట్రేషన్", "ఆదాయ రుజువు"},
				ApplicationProcess: "బ్యాంక్‌కు వెళ్లండి → పత్రాలు సమర్పించండి → లోన్ ఆమోదం → వాహనం కొనుగోలు",
			},
		}
	case "ta-IN":
		return []SchemeResponse{
			{
				Name:               "முத்ரா யோஜனா - தருண்",
				Description:        "வாகன மேம்படுத்தல் மற்றும் வணிக விரிவாக்கத்திற்கான வணிக கடன்",
				Subsidy:            "₹10 லட்சம் வரை மானிய வட்டி விகிதத்தில் கடன்",
				Eligibility:        "சிறு போக்குவரத்து வணிகர்கள், தற்போதைய வாகன உரிமையாளர்கள்",
				ProcessingTime:     "15-30 நாட்கள்",
				Contact:            "அருகிலுள்ள வங்கி அல்லது முத்ரா போர்ட்டல்",
				Documents:          []string{"ஆதார் கார்டு", "வாகன RC", "வணிக பதிவு", "வருமான சான்று"},
				ApplicationProcess: "வங்கிக்கு செல்லுங்கள் → ஆவணங்களை சமர்ப்பிக்கவும் → கடன் ஒப்புதல் → வாகன வாங்கல்",
			},
		}
	default: // en-IN
		return []SchemeResponse{
			{
				Name:               "Mudra Yojana - Tarun",
				Description:        "Business loan for vehicle upgrade and expansion",
				Subsidy:            "₹10 lakh loan with subsidized interest rates",
				Eligibility:        "Small transport business owners, existing vehicle owners",
				ProcessingTime:     "15-30 days",
				Contact:            "Nearest bank or MUDRA portal",
				Documents:          []string{"Aadhaar Card", "Vehicle RC", "Business Registration", "Income Proof"},
				ApplicationProcess: "Visit bank → Submit documents → Loan approval → Vehicle purchase",
			},
			{
				Name:               "Stand Up India Scheme",
				Description:        "Bank loans for SC/ST/Women entrepreneurs in transport",
				Subsidy:            "₹10 lakh to ₹1 crore with government guarantee",
				Eligibility:        "SC/ST/Women, first-time entrepreneurs",
				ProcessingTime:     "45-60 days",
				Contact:            "Scheduled Commercial Banks",
				Documents:          []string{"Aadhaar", "Caste Certificate", "Business Plan", "Vehicle Quotation"},
				ApplicationProcess: "Bank application → Document verification → Loan sanction → Vehicle purchase",
			},
		}
	}
}

// getMockRights returns mock rights data based on language
func getMockRights(language string) []RightResponse {
	switch language {
	case "hi-IN":
		return []RightResponse{
			{
				Title:       "ट्रैफिक चालान का विरोध करने का अधिकार",
				Description: "आपको किसी भी गलत ट्रैफिक फाइन का विरोध करने का कानूनी अधिकार है",
				LegalBasis:  "मोटर वाहन अधिनियम 1988, धारा 207",
				HowToExercise: []string{
					"घटना स्थल और अपने वाहन की तस्वीरें लें",
					"चालान नंबर और अधिकारी का विवरण नोट करें",
					"30 दिन के भीतर नजदीकी ट्रैफिक कोर्ट जाएं",
					"अपने सबूत और स्पष्टीकरण जमा करें",
				},
				ContactForHelp: []string{
					"ट्रैफिक कोर्ट: स्थानीय मजिस्ट्रेट कोर्ट जाएं",
					"RTO हेल्पलाइन: 1800-267-0001",
					"ऑनलाइन पोर्टल: parivahan.gov.in",
				},
			},
		}
	default: // en-IN
		return []RightResponse{
			{
				Title:       "Right to Contest Traffic Challan",
				Description: "You have the legal right to contest any traffic fine you believe is wrongly issued",
				LegalBasis:  "Motor Vehicle Act 1988, Section 207",
				HowToExercise: []string{
					"Take photos of the incident location and your vehicle",
					"Note down the challan number and officer details",
					"Visit the nearest traffic court within 30 days",
					"Submit your evidence and explanation",
				},
				ContactForHelp: []string{
					"Traffic Court: Visit local magistrate court",
					"RTO Helpline: 1800-267-0001",
					"Online Portal: parivahan.gov.in",
				},
			},
			{
				Title:       "Right to Payment for Services",
				Description: "You have the right to receive agreed payment for transport services rendered",
				LegalBasis:  "Contract Act 1872, Consumer Protection Act 2019",
				HowToExercise: []string{
					"Keep written agreement or booking confirmation",
					"Document the service provided (photos, GPS logs)",
					"Send legal notice for payment demand",
					"File complaint in consumer court if amount > ₹20,000",
				},
				ContactForHelp: []string{
					"Consumer Court: For disputes above ₹20,000",
					"Lok Adalat: For quick resolution",
					"Legal Aid: District Legal Services Authority",
				},
			},
		}
	}
}

// GetEmpowermentStatus returns the status of empowerment services
func GetEmpowermentStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"status":    "active",
		"services":  []string{"government_schemes", "driver_rights", "legal_help"},
		"languages": []string{"en-IN", "hi-IN", "te-IN", "ta-IN"},
		"version":   "1.0.0",
	})
}
