package controllers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"
	"porter-saathi-backend/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// SendOTP generates and sends OTP for mobile verification
func SendOTP(c *gin.Context) {
	var request struct {
		Mobile string `json:"mobile" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate 6-digit OTP
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))

	// In production, you would send this via SMS
	// For now, we'll just log it and return success
	fmt.Printf("OTP for %s: %s\n", request.Mobile, otp)

	// Store OTP in database with expiration (5 minutes)
	collection := config.GetDB().Collection("otps")
	_, err := collection.InsertOne(context.Background(), bson.M{
		"mobile":     request.Mobile,
		"otp":        otp,
		"expires_at": time.Now().Add(5 * time.Minute),
		"created_at": time.Now(),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP sent successfully",
		"otp":     otp, // Remove this in production
	})
}

// Login handles user login with mobile and OTP
func Login(c *gin.Context) {
	var request models.LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify OTP
	otpCollection := config.GetDB().Collection("otps")
	var otpDoc bson.M
	err := otpCollection.FindOne(context.Background(), bson.M{
		"mobile":     request.Mobile,
		"otp":        request.OTP,
		"expires_at": bson.M{"$gt": time.Now()},
	}).Decode(&otpDoc)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired OTP"})
		return
	}

	// Find user
	userCollection := config.GetDB().Collection("users")
	var user models.User
	err = userCollection.FindOne(context.Background(), bson.M{"mobile": request.Mobile}).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found. Please sign up first."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Delete used OTP
	otpCollection.DeleteOne(context.Background(), bson.M{"_id": otpDoc["_id"]})

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user":    user,
	})
}

// Signup handles user registration
func Signup(c *gin.Context) {
	var request models.SignupRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	collection := config.GetDB().Collection("users")
	var existingUser models.User
	err := collection.FindOne(context.Background(), bson.M{"mobile": request.Mobile}).Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Create new user
	user := models.User{
		ID:               primitive.NewObjectID(),
		Mobile:           request.Mobile,
		Name:             request.Name,
		AadharNumber:     request.AadharNumber,
		LicenseNumber:    request.LicenseNumber,
		VehicleNumber:    request.VehicleNumber,
		EmergencyContact: request.EmergencyContact,
		IsVerified:       false,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	_, err = collection.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"token":   token,
		"user":    user,
	})
}
