package utils

import (
	"context"
	"log"
	"time"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SeedDatabase() {
	log.Println("Starting database seeding...")

	// Seed tutorials
	seedTutorials()

	log.Println("Database seeding completed!")
}

func seedTutorials() {
	collection := config.GetDB().Collection("tutorials")

	// Check if tutorials already exist
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Error checking tutorial count: %v", err)
		return
	}

	if count > 0 {
		log.Println("Tutorials already exist, skipping seeding")
		return
	}

	// Tutorial data from frontend mockData
	tutorials := []models.Tutorial{
		{
			ID:       primitive.NewObjectID(),
			Category: "challan",
			Title: models.MultiLanguageText{
				Hindi:   "ट्रैफिक चालान कैसे भरें?",
				English: "How to Pay a Traffic Challan?",
				Telugu:  "ట్రాఫిక్ చలాన్ ఎలా చెల్లించాలి?",
				Tamil:   "போக்குவரத்து சலானை எப்படி செலுத்துவது?",
			},
			Steps: models.MultiLanguageSteps{
				Hindi:   []string{"चालान का फोटो लें", "ऐप में अपलोड करें", "ऑनलाइन पेमेंट करें", "कन्फर्मेशन का इंतज़ार करें"},
				English: []string{"Take a photo of the challan", "Upload it in the app", "Make online payment", "Wait for confirmation"},
				Telugu:  []string{"చలాన్ ఫోటో తీయండి", "యాప్‌లో అప్‌లోడ్ చేయండి", "ఆన్‌లైన్‌లో చెల్లించండి", "నిర్ధారణ కోసం వేచి ఉండండి"},
				Tamil:   []string{"சலானின் புகைப்படம் எடுக்கவும்", "பயன்பாட்டில் பதிவேற்றவும்", "ஆன்லைனில் பணம் செலுத்தவும்", "உறுதிப்படுத்தலுக்காக காத்திருக்கவும்"},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:       primitive.NewObjectID(),
			Category: "insurance",
			Title: models.MultiLanguageText{
				Hindi:   "गाड़ी का बीमा कैसे क्लेम करें?",
				English: "How to Claim Vehicle Insurance?",
				Telugu:  "వాహన బీమాను ఎలా క్లెయిమ్ చేయాలి?",
				Tamil:   "வாகனக் காப்பீட்டை எப்படி கோருவது?",
			},
			Steps: models.MultiLanguageSteps{
				Hindi:   []string{"दुर्घटना की रिपोर्ट करें", "बीमा कंपनी को कॉल करें", "सर्वेयर का इंतज़ार करें", "दस्तावेज़ जमा करें"},
				English: []string{"Report the accident", "Call the insurance company", "Wait for the surveyor", "Submit the documents"},
				Telugu:  []string{"ప్రమాదాన్ని నివేదించండి", "భీమా కంపెనీకి కాల్ చేయండి", "సర్వేయర్ కోసం వేచి ఉండండి", "పత్రాలను సమర్పించండి"},
				Tamil:   []string{"விபத்தைப் புகாரளிக்கவும்", "காப்பீட்டு நிறுவனத்தை அழைக்கவும்", "சர்வேயருக்காக காத்திருக்கவும்", "ஆவணங்களைச் சமர்ப்பிக்கவும்"},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:       primitive.NewObjectID(),
			Category: "digilocker",
			Title: models.MultiLanguageText{
				Hindi:   "डिजीलॉकर में दस्तावेज़ कैसे रखें?",
				English: "How to Keep Documents in DigiLocker?",
				Telugu:  "డిజీలాకర్‌లో పత్రాలను ఎలా ఉంచాలి?",
				Tamil:   "டிஜிலாக்கரில் ஆவணங்களை எப்படி வைப்பது?",
			},
			Steps: models.MultiLanguageSteps{
				Hindi:   []string{"डिजीलॉकर ऐप डाउनलोड करें", "आधार से लिंक करें", "अपने दस्तावेज़ प्राप्त करें", "सुरक्षित रखें"},
				English: []string{"Download the DigiLocker app", "Link with Aadhaar", "Fetch your documents", "Keep them safe and secure"},
				Telugu:  []string{"డిజీలాకర్ యాప్ డౌన్‌లోడ్ చేసుకోండి", "ఆధార్‌తో లింక్ చేయండి", "మీ పత్రాలను పొందండి", "వాటిని సురక్షితంగా ఉంచండి"},
				Tamil:   []string{"டிஜிலாக்கர் செயலியைப் பதிவிறக்கவும்", "ஆதாருடன் இணைக்கவும்", "உங்கள் ஆவணங்களைப் பெறவும்", "பாதுப்பாக வைக்கவும்"},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:       primitive.NewObjectID(),
			Category: "customer",
			Title: models.MultiLanguageText{
				Hindi:   "ग्राहक से कैसे बात करें?",
				English: "How to Talk to Customers?",
				Telugu:  "వినియోగదారులతో ఎలా మాట్లాడాలి?",
				Tamil:   "வாடிக்கையாளர்களிடம் எப்படி பேசுவது?",
			},
			Steps: models.MultiLanguageSteps{
				Hindi:   []string{"हमेशा मुस्कुराएं", "विनम्रता से बात करें", "समस्या ध्यान से सुनें", "मदद करने की कोशिश करें"},
				English: []string{"Always smile", "Speak politely", "Listen to the problem carefully", "Try to help"},
				Telugu:  []string{"ఎల్లప్పుడూ నవ్వండి", "మర్యాదగా మాట్లాడండి", "సమస్యను జాగ్రత్తగా వినండి", "సహాయం చేయడానికి ప్రయత్నించండి"},
				Tamil:   []string{"எப்போதும் சிரிக்கவும்", "பணிவாகப் பேசுங்கள்", "சிக்கலை கவனமாகக் கேளுங்கள்", "உதவ முயற்சிக்கவும்"},
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Insert tutorials
	var docs []interface{}
	for _, tutorial := range tutorials {
		docs = append(docs, tutorial)
	}

	_, err = collection.InsertMany(context.Background(), docs)
	if err != nil {
		log.Printf("Error seeding tutorials: %v", err)
		return
	}

	log.Printf("Successfully seeded %d tutorials", len(tutorials))
}
