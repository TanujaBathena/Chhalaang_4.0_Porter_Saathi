package main

import (
	"log"
	"os"

	"porter-saathi-backend/config"
	"porter-saathi-backend/routes"
	"porter-saathi-backend/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	config.ConnectDB()

	// Seed database with initial data
	utils.SeedDatabase()

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration - Allow all origins for development
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = true

	log.Printf("CORS Configuration: Allowing all origins for development")
	r.Use(cors.New(corsConfig))

	// Setup routes
	routes.SetupRoutes(r)

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
