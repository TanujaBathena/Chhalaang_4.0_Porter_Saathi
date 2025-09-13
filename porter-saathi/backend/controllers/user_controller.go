package controllers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// mapDocumentType maps frontend document type names to backend field names
func mapDocumentType(frontendType string) string {
	mapping := map[string]string{
		"aadharCard":     "aadhar_card",
		"drivingLicense": "driving_license",
		"vehicleRC":      "vehicle_rc",
		"profilePhoto":   "profile_photo",
	}

	if backendType, exists := mapping[frontendType]; exists {
		return backendType
	}

	// Return original if no mapping found (for backward compatibility)
	return frontendType
}

// GetUserProfile returns user profile information
func GetUserProfile(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetDB().Collection("users")
	var user models.User
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUserProfile updates user profile information
func UpdateUserProfile(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var updateData bson.M
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Add updated timestamp
	updateData["updated_at"] = time.Now()

	collection := config.GetDB().Collection("users")
	result, err := collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{"$set": updateData},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// UploadDocument handles document file uploads
func UploadDocument(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get document type from form
	frontendDocType := c.PostForm("documentType")
	if frontendDocType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Document type is required"})
		return
	}

	// Map frontend document type to backend field name
	docType := mapDocumentType(frontendDocType)

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file size (5MB limit)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 5MB limit"})
		return
	}

	// Validate file type
	allowedTypes := map[string]bool{
		"image/jpeg":      true,
		"image/jpg":       true,
		"image/png":       true,
		"application/pdf": true,
	}

	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only JPG, PNG, and PDF files are allowed"})
		return
	}

	// Create upload directory if it doesn't exist
	uploadDir := os.Getenv("UPLOAD_PATH")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	userUploadDir := filepath.Join(uploadDir, userID)
	if err := os.MkdirAll(userUploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	fileExt := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%s_%s%s", frontendDocType, uuid.New().String(), fileExt)
	filePath := filepath.Join(userUploadDir, fileName)

	// Save file
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Create document record
	document := &models.DocumentFile{
		FileName:    fileName,
		FileURL:     fmt.Sprintf("/uploads/%s/%s", userID, fileName),
		FileSize:    header.Size,
		ContentType: contentType,
		UploadedAt:  time.Now(),
	}

	// Update user document in database
	collection := config.GetDB().Collection("users")
	updateField := fmt.Sprintf("documents.%s", docType)

	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": objectID},
		bson.M{
			"$set": bson.M{
				updateField:  document,
				"updated_at": time.Now(),
			},
		},
	)

	if err != nil {
		// Clean up uploaded file if database update fails
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user document"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Document uploaded successfully",
		"document": document,
	})
}
