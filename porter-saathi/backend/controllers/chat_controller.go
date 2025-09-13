package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// SendMessage handles AI chat requests
func SendMessage(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var request models.ChatRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get or create chat session
	sessionID := c.Query("sessionId")
	var session models.ChatSession
	collection := config.GetDB().Collection("chat_sessions")

	if sessionID != "" {
		sessionObjectID, err := primitive.ObjectIDFromHex(sessionID)
		if err == nil {
			collection.FindOne(context.Background(), bson.M{"_id": sessionObjectID}).Decode(&session)
		}
	}

	// Create new session if not found
	if session.ID.IsZero() {
		session = models.ChatSession{
			ID:          primitive.NewObjectID(),
			UserID:      objectID,
			SessionType: request.SessionType,
			Language:    request.Language,
			Messages:    []models.ChatMessage{},
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
	}

	// Add user message
	userMessage := models.ChatMessage{
		Sender:    "user",
		Text:      request.Message,
		Timestamp: time.Now(),
	}
	session.Messages = append(session.Messages, userMessage)

	// Fetch user earnings data for AI context
	earningsData, weeklyData := fetchUserEarningsData(objectID)

	// Get AI response
	aiResponse, err := getAIResponse(request.Message, session.Messages, request.SessionType, request.Language, earningsData, weeklyData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI response"})
		return
	}

	// Add AI message
	aiMessage := models.ChatMessage{
		Sender:    "ai",
		Text:      aiResponse,
		Timestamp: time.Now(),
	}
	session.Messages = append(session.Messages, aiMessage)
	session.UpdatedAt = time.Now()

	// Save session
	if sessionID == "" {
		collection.InsertOne(context.Background(), session)
	} else {
		collection.UpdateOne(
			context.Background(),
			bson.M{"_id": session.ID},
			bson.M{"$set": bson.M{
				"messages":   session.Messages,
				"updated_at": session.UpdatedAt,
			}},
		)
	}

	response := models.ChatResponse{
		Response:  aiResponse,
		SessionID: session.ID.Hex(),
		Messages:  session.Messages,
	}

	c.JSON(http.StatusOK, response)
}

// GetChatHistory returns chat history for a session
func GetChatHistory(c *gin.Context) {
	userID := c.GetString("userID")
	sessionID := c.Param("sessionId")

	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	sessionObjectID, err := primitive.ObjectIDFromHex(sessionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	collection := config.GetDB().Collection("chat_sessions")
	var session models.ChatSession
	err = collection.FindOne(context.Background(), bson.M{
		"_id":     sessionObjectID,
		"user_id": objectID,
	}).Decode(&session)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, session)
}

func getAIResponse(userQuery string, chatHistory []models.ChatMessage, sessionType, language string, earningsData *models.EarningsResponse, weeklyData *models.WeeklyEarningsResponse) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	apiUrl := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=%s", apiKey)

	// Create earnings context string
	earningsContext := ""
	if earningsData != nil && weeklyData != nil {
		earningsContext = fmt.Sprintf(`
		**EARNINGS DATA AVAILABLE:**
		Today's Earnings: Revenue: ₹%.2f, Expenses: ₹%.2f, Net Earnings: ₹%.2f, Trips: %d
		Last Week's Earnings: Revenue: ₹%.2f, Expenses: ₹%.2f, Net Earnings: ₹%.2f, Trips: %d
		Current Week Total: Revenue: ₹%.2f, Expenses: ₹%.2f, Net Earnings: ₹%.2f, Trips: %d
		Previous Week Total: Revenue: ₹%.2f, Expenses: ₹%.2f, Net Earnings: ₹%.2f, Trips: %d
		Weekly Growth: %.1f%%
		
		**WHEN USER ASKS ABOUT EARNINGS:**
		- Provide specific numbers from the data above
		- Compare today vs last week, current week vs previous week
		- Mention growth percentage if relevant
		- Be encouraging and supportive about their progress`,
			earningsData.Today.Revenue, earningsData.Today.Expenses, earningsData.Today.NetEarnings, earningsData.Today.Trips,
			earningsData.LastWeek.Revenue, earningsData.LastWeek.Expenses, earningsData.LastWeek.NetEarnings, earningsData.LastWeek.Trips,
			weeklyData.CurrentWeek.Revenue, weeklyData.CurrentWeek.Expenses, weeklyData.CurrentWeek.NetEarnings, weeklyData.CurrentWeek.Trips,
			weeklyData.PreviousWeek.Revenue, weeklyData.PreviousWeek.Expenses, weeklyData.PreviousWeek.NetEarnings, weeklyData.PreviousWeek.Trips,
			weeklyData.GrowthPercentage)
	}

	// Create system prompt based on session type
	var systemPrompt string
	if sessionType == "guru" {
		systemPrompt = fmt.Sprintf(`You are "Porter Guru," an interactive problem-solving AI expert for drivers. Your goal is to diagnose any problem the driver is facing—whether it's with their vehicle, the Porter Saathi app itself, or understanding their earnings—through a calm, diagnostic conversation.
		**CRITICAL RULE:** Do NOT provide a solution immediately. First, ask simple, clarifying questions one by one to understand the issue fully. Engage in a back-and-forth dialogue.
		%s
		**Core Directives:**
		1. **Diagnose First:** Always ask questions before giving answers.
		2. **Language Discipline:** Respond ONLY in the language: %s.
		3. **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".
		4. **Use Chat History:** Consider the previous messages in this conversation: %s.`, earningsContext, language, formatChatHistory(chatHistory))
	} else {
		systemPrompt = fmt.Sprintf(`You are "Porter Saathi," an expert AI customer support agent for truck drivers in India. Your only goal is to provide clear, precise, and helpful answers.
		%s
		**Core Directives:**
		1. **Precision is Key:** Do NOT give vague answers. If you don't know, say so.
		2. **Language Discipline:** Respond ONLY in the language: %s.
		3. **JSON Output:** Your entire output MUST be a single, valid JSON object with the key "response_text".`, earningsContext, language)
	}

	payload := map[string]interface{}{
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]string{
				{"text": systemPrompt},
			},
		},
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": userQuery},
				},
			},
		},
		"generationConfig": map[string]string{
			"responseMimeType": "application/json",
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	resp, err := http.Post(apiUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	// Extract response text from Gemini API response
	candidates, ok := result["candidates"].([]interface{})
	if !ok || len(candidates) == 0 {
		return "Sorry, I couldn't process your request.", nil
	}

	candidate := candidates[0].(map[string]interface{})
	content := candidate["content"].(map[string]interface{})
	parts := content["parts"].([]interface{})
	if len(parts) == 0 {
		return "Sorry, I couldn't process your request.", nil
	}

	responseText := parts[0].(map[string]interface{})["text"].(string)

	// Parse JSON response
	var jsonResponse map[string]interface{}
	if err := json.Unmarshal([]byte(responseText), &jsonResponse); err != nil {
		return responseText, nil // Return as-is if not valid JSON
	}

	if response, ok := jsonResponse["response_text"].(string); ok {
		return response, nil
	}

	return responseText, nil
}

func formatChatHistory(messages []models.ChatMessage) string {
	historyJSON, _ := json.Marshal(messages)
	return string(historyJSON)
}

// fetchUserEarningsData retrieves user's earnings data for AI context
func fetchUserEarningsData(userID primitive.ObjectID) (*models.EarningsResponse, *models.WeeklyEarningsResponse) {
	collection := config.GetDB().Collection("earnings")

	// Get today's earnings
	today := time.Now()
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var todayEarnings []models.Earnings
	cursor, err := collection.Find(context.Background(), bson.M{
		"user_id": userID,
		"date": bson.M{
			"$gte": startOfDay,
			"$lt":  endOfDay,
		},
	})
	if err == nil {
		cursor.All(context.Background(), &todayEarnings)
	}

	// Get last week's earnings
	lastWeekStart := startOfDay.AddDate(0, 0, -7)
	var lastWeekEarnings []models.Earnings
	cursor, err = collection.Find(context.Background(), bson.M{
		"user_id": userID,
		"date": bson.M{
			"$gte": lastWeekStart,
			"$lt":  startOfDay,
		},
	})
	if err == nil {
		cursor.All(context.Background(), &lastWeekEarnings)
	}

	// Calculate today and last week summaries
	todaySummary := calculateSummary(todayEarnings)
	lastWeekSummary := calculateSummary(lastWeekEarnings)

	earningsResponse := &models.EarningsResponse{
		Today:    todaySummary,
		LastWeek: lastWeekSummary,
	}

	// Get current week's earnings
	weekday := int(today.Weekday())
	if weekday == 0 { // Sunday
		weekday = 7
	}
	startOfWeek := today.AddDate(0, 0, -(weekday - 1))
	startOfWeek = time.Date(startOfWeek.Year(), startOfWeek.Month(), startOfWeek.Day(), 0, 0, 0, 0, startOfWeek.Location())
	endOfWeek := startOfWeek.AddDate(0, 0, 7)

	// Get previous week for comparison
	prevWeekStart := startOfWeek.AddDate(0, 0, -7)

	// Fetch current week's earnings
	var currentWeekEarnings []models.Earnings
	cursor, err = collection.Find(context.Background(), bson.M{
		"user_id": userID,
		"date": bson.M{
			"$gte": startOfWeek,
			"$lt":  endOfWeek,
		},
	})
	if err == nil {
		cursor.All(context.Background(), &currentWeekEarnings)
	}

	// Fetch previous week's earnings for comparison
	var prevWeekEarnings []models.Earnings
	cursor, err = collection.Find(context.Background(), bson.M{
		"user_id": userID,
		"date": bson.M{
			"$gte": prevWeekStart,
			"$lt":  startOfWeek,
		},
	})
	if err == nil {
		cursor.All(context.Background(), &prevWeekEarnings)
	}

	// Group earnings by day
	dailyEarnings := make(map[string]models.DailyEarnings)

	// Initialize all days of the week
	for i := 0; i < 7; i++ {
		day := startOfWeek.AddDate(0, 0, i)
		dayKey := day.Format("2006-01-02")
		dailyEarnings[dayKey] = models.DailyEarnings{
			Date:        day,
			DayName:     day.Format("Mon"),
			Revenue:     0,
			Expenses:    0,
			Trips:       0,
			NetEarnings: 0,
		}
	}

	// Fill in actual earnings data
	for _, earning := range currentWeekEarnings {
		dayKey := earning.Date.Format("2006-01-02")
		if daily, exists := dailyEarnings[dayKey]; exists {
			daily.Revenue += earning.Revenue
			daily.Expenses += earning.Expenses
			daily.Trips += earning.Trips
			daily.NetEarnings += earning.NetEarnings
			dailyEarnings[dayKey] = daily
		}
	}

	// Convert map to ordered slice
	var weeklyData []models.DailyEarnings
	for i := 0; i < 7; i++ {
		day := startOfWeek.AddDate(0, 0, i)
		dayKey := day.Format("2006-01-02")
		weeklyData = append(weeklyData, dailyEarnings[dayKey])
	}

	// Calculate totals and growth
	currentWeekSummary := calculateSummary(currentWeekEarnings)
	prevWeekSummary := calculateSummary(prevWeekEarnings)

	var growthPercentage float64
	if prevWeekSummary.NetEarnings > 0 {
		growthPercentage = ((currentWeekSummary.NetEarnings - prevWeekSummary.NetEarnings) / prevWeekSummary.NetEarnings) * 100
	}

	weeklyResponse := &models.WeeklyEarningsResponse{
		WeeklyData:       weeklyData,
		CurrentWeek:      currentWeekSummary,
		PreviousWeek:     prevWeekSummary,
		GrowthPercentage: growthPercentage,
		WeekStartDate:    startOfWeek,
	}

	return earningsResponse, weeklyResponse
}
