package controllers

import (
	"context"
	"net/http"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

// GetTutorials returns all tutorials
func GetTutorials(c *gin.Context) {
	collection := config.GetDB().Collection("tutorials")

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tutorials"})
		return
	}
	defer cursor.Close(context.Background())

	var tutorials []models.Tutorial
	if err = cursor.All(context.Background(), &tutorials); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tutorials"})
		return
	}

	// Convert to response format
	var response []models.TutorialResponse
	for _, tutorial := range tutorials {
		response = append(response, models.TutorialResponse{
			ID:       tutorial.ID.Hex(),
			Category: tutorial.Category,
			Title:    tutorial.Title,
			Steps:    tutorial.Steps,
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetTutorialByID returns a specific tutorial
func GetTutorialByID(c *gin.Context) {
	tutorialID := c.Param("id")

	collection := config.GetDB().Collection("tutorials")
	var tutorial models.Tutorial

	err := collection.FindOne(context.Background(), bson.M{"_id": tutorialID}).Decode(&tutorial)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tutorial not found"})
		return
	}

	response := models.TutorialResponse{
		ID:       tutorial.ID.Hex(),
		Category: tutorial.Category,
		Title:    tutorial.Title,
		Steps:    tutorial.Steps,
	}

	c.JSON(http.StatusOK, response)
}

// GetTutorialsByCategory returns tutorials filtered by category
func GetTutorialsByCategory(c *gin.Context) {
	category := c.Param("category")

	collection := config.GetDB().Collection("tutorials")
	cursor, err := collection.Find(context.Background(), bson.M{"category": category})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tutorials"})
		return
	}
	defer cursor.Close(context.Background())

	var tutorials []models.Tutorial
	if err = cursor.All(context.Background(), &tutorials); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tutorials"})
		return
	}

	// Convert to response format
	var response []models.TutorialResponse
	for _, tutorial := range tutorials {
		response = append(response, models.TutorialResponse{
			ID:       tutorial.ID.Hex(),
			Category: tutorial.Category,
			Title:    tutorial.Title,
			Steps:    tutorial.Steps,
		})
	}

	c.JSON(http.StatusOK, response)
}
