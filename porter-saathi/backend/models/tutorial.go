package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Tutorial struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Category  string             `bson:"category" json:"category"`
	Title     MultiLanguageText  `bson:"title" json:"title"`
	Steps     MultiLanguageSteps `bson:"steps" json:"steps"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updatedAt"`
}

type MultiLanguageText struct {
	Hindi   string `bson:"hi" json:"hi"`
	English string `bson:"en" json:"en"`
	Telugu  string `bson:"te" json:"te"`
	Tamil   string `bson:"ta" json:"ta"`
}

type MultiLanguageSteps struct {
	Hindi   []string `bson:"hi" json:"hi"`
	English []string `bson:"en" json:"en"`
	Telugu  []string `bson:"te" json:"te"`
	Tamil   []string `bson:"ta" json:"ta"`
}

type TutorialResponse struct {
	ID       string             `json:"id"`
	Category string             `json:"category"`
	Title    MultiLanguageText  `json:"title"`
	Steps    MultiLanguageSteps `json:"steps"`
}
