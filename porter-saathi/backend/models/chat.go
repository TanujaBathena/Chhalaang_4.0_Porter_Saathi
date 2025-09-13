package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatSession struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"userId"`
	SessionType string             `bson:"session_type" json:"sessionType"` // "general" or "guru"
	Messages    []ChatMessage      `bson:"messages" json:"messages"`
	Language    string             `bson:"language" json:"language"`
	CreatedAt   time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updatedAt"`
}

type ChatMessage struct {
	Sender    string    `bson:"sender" json:"sender"` // "user" or "ai"
	Text      string    `bson:"text" json:"text"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

type ChatRequest struct {
	Message     string `json:"message" binding:"required"`
	SessionType string `json:"sessionType"`
	Language    string `json:"language"`
}

type ChatResponse struct {
	Response  string        `json:"response"`
	SessionID string        `json:"sessionId"`
	Messages  []ChatMessage `json:"messages"`
}
