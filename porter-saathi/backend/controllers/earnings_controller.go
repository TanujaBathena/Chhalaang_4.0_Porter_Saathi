package controllers

import (
	"context"
	"net/http"
	"time"

	"porter-saathi-backend/config"
	"porter-saathi-backend/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetEarnings returns today's and last week's earnings
func GetEarnings(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetDB().Collection("earnings")

	// Get today's earnings
	today := time.Now()
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var todayEarnings []models.Earnings
	cursor, err := collection.Find(context.Background(), bson.M{
		"user_id": objectID,
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
		"user_id": objectID,
		"date": bson.M{
			"$gte": lastWeekStart,
			"$lt":  startOfDay,
		},
	})
	if err == nil {
		cursor.All(context.Background(), &lastWeekEarnings)
	}

	// Calculate totals
	todaySummary := calculateSummary(todayEarnings)
	lastWeekSummary := calculateSummary(lastWeekEarnings)

	response := models.EarningsResponse{
		Today:    todaySummary,
		LastWeek: lastWeekSummary,
	}

	c.JSON(http.StatusOK, response)
}

// GetWeeklyEarnings returns daily earnings for the current week
func GetWeeklyEarnings(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetDB().Collection("earnings")

	// Get current week's start (Monday)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 { // Sunday
		weekday = 7
	}
	startOfWeek := now.AddDate(0, 0, -(weekday - 1))
	startOfWeek = time.Date(startOfWeek.Year(), startOfWeek.Month(), startOfWeek.Day(), 0, 0, 0, 0, startOfWeek.Location())
	endOfWeek := startOfWeek.AddDate(0, 0, 7)

	// Get previous week for comparison
	prevWeekStart := startOfWeek.AddDate(0, 0, -7)

	// Fetch current week's earnings
	var currentWeekEarnings []models.Earnings
	cursor, err := collection.Find(context.Background(), bson.M{
		"user_id": objectID,
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
		"user_id": objectID,
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

	response := models.WeeklyEarningsResponse{
		WeeklyData:       weeklyData,
		CurrentWeek:      currentWeekSummary,
		PreviousWeek:     prevWeekSummary,
		GrowthPercentage: growthPercentage,
		WeekStartDate:    startOfWeek,
	}

	c.JSON(http.StatusOK, response)
}

// AddEarnings adds new earnings record
func AddEarnings(c *gin.Context) {
	userID := c.GetString("userID")
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var request models.EarningsRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", request.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	earnings := models.Earnings{
		ID:          primitive.NewObjectID(),
		UserID:      objectID,
		Date:        date,
		Revenue:     request.Revenue,
		Expenses:    request.Expenses,
		Trips:       request.Trips,
		NetEarnings: request.Revenue - request.Expenses,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	collection := config.GetDB().Collection("earnings")
	_, err = collection.InsertOne(context.Background(), earnings)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save earnings"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Earnings added successfully",
		"earnings": earnings,
	})
}

func calculateSummary(earnings []models.Earnings) models.EarningsSummary {
	var totalRevenue, totalExpenses float64
	var totalTrips int

	for _, e := range earnings {
		totalRevenue += e.Revenue
		totalExpenses += e.Expenses
		totalTrips += e.Trips
	}

	return models.EarningsSummary{
		Revenue:     totalRevenue,
		Expenses:    totalExpenses,
		Trips:       totalTrips,
		NetEarnings: totalRevenue - totalExpenses,
	}
}
