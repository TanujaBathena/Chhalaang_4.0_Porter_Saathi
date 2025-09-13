package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Earnings struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	Date        time.Time          `bson:"date" json:"date"`
	Revenue     float64            `bson:"revenue" json:"revenue"`
	Expenses    float64            `bson:"expenses" json:"expenses"`
	Trips       int                `bson:"trips" json:"trips"`
	NetEarnings float64            `bson:"net_earnings" json:"netEarnings"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

type EarningsRequest struct {
	Date     string  `json:"date" binding:"required"`
	Revenue  float64 `json:"revenue" binding:"required"`
	Expenses float64 `json:"expenses" binding:"required"`
	Trips    int     `json:"trips" binding:"required"`
}

type EarningsResponse struct {
	Today    EarningsSummary `json:"today"`
	LastWeek EarningsSummary `json:"lastWeek"`
}

type EarningsSummary struct {
	Revenue     float64 `json:"revenue"`
	Expenses    float64 `json:"expenses"`
	Trips       int     `json:"trips"`
	NetEarnings float64 `json:"netEarnings"`
}

type DailyEarnings struct {
	Date        time.Time `json:"date"`
	DayName     string    `json:"dayName"`
	Revenue     float64   `json:"revenue"`
	Expenses    float64   `json:"expenses"`
	Trips       int       `json:"trips"`
	NetEarnings float64   `json:"netEarnings"`
}

type WeeklyEarningsResponse struct {
	WeeklyData       []DailyEarnings `json:"weeklyData"`
	CurrentWeek      EarningsSummary `json:"currentWeek"`
	PreviousWeek     EarningsSummary `json:"previousWeek"`
	GrowthPercentage float64         `json:"growthPercentage"`
	WeekStartDate    time.Time       `json:"weekStartDate"`
}
