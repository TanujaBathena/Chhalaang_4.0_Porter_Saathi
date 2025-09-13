package routes

import (
	"porter-saathi-backend/controllers"
	"porter-saathi-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "OK", "message": "Porter Saathi Backend is running"})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Public routes (no authentication required)
		auth := v1.Group("/auth")
		{
			auth.POST("/send-otp", controllers.SendOTP)
			auth.POST("/login", controllers.Login)
			auth.POST("/signup", controllers.Signup)
		}

		// Public tutorials (can be accessed without auth for demo purposes)
		v1.GET("/tutorials", controllers.GetTutorials)
		v1.GET("/tutorials/:id", controllers.GetTutorialByID)
		v1.GET("/tutorials/category/:category", controllers.GetTutorialsByCategory)

		// OCR routes (public for signup process)
		ocr := v1.Group("/ocr")
		{
			ocr.GET("/status", controllers.GetOCRStatus)
			ocr.POST("/process-aadhaar", controllers.ProcessAadhaarOCR)
		}

		// Empowerment routes (public for accessibility)
		empowerment := v1.Group("/empowerment")
		{
			empowerment.GET("/status", controllers.GetEmpowermentStatus)
			empowerment.POST("/query", controllers.ProcessEmpowermentQuery)
		}

		// Protected routes (authentication required)
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User routes
			user := protected.Group("/user")
			{
				user.GET("/profile", controllers.GetUserProfile)
				user.PUT("/profile", controllers.UpdateUserProfile)
				user.POST("/upload-document", controllers.UploadDocument)
			}

			// Earnings routes
			earnings := protected.Group("/earnings")
			{
				earnings.GET("/", controllers.GetEarnings)
				earnings.GET("/weekly", controllers.GetWeeklyEarnings)
				earnings.POST("/", controllers.AddEarnings)
			}

			// Chat routes
			chat := protected.Group("/chat")
			{
				chat.POST("/message", controllers.SendMessage)
				chat.GET("/history/:sessionId", controllers.GetChatHistory)
			}

		}
	}
}
