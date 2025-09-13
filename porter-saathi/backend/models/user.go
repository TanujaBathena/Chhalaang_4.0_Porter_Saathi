package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Mobile            string             `bson:"mobile" json:"mobile" binding:"required"`
	Name              string             `bson:"name" json:"name"`
	AadharNumber      string             `bson:"aadhar_number" json:"aadharNumber"`
	LicenseNumber     string             `bson:"license_number" json:"licenseNumber"`
	VehicleNumber     string             `bson:"vehicle_number" json:"vehicleNumber"`
	EmergencyContact  string             `bson:"emergency_contact" json:"emergencyContact"`
	PreferredLanguage string             `bson:"preferred_language" json:"preferredLanguage"`
	Documents         Documents          `bson:"documents" json:"documents"`
	IsVerified        bool               `bson:"is_verified" json:"isVerified"`
	CreatedAt         time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updated_at" json:"updatedAt"`
}

type Documents struct {
	AadharCard     *DocumentFile `bson:"aadhar_card" json:"aadharCard"`
	DrivingLicense *DocumentFile `bson:"driving_license" json:"drivingLicense"`
	VehicleRC      *DocumentFile `bson:"vehicle_rc" json:"vehicleRC"`
	ProfilePhoto   *DocumentFile `bson:"profile_photo" json:"profilePhoto"`
}

type DocumentFile struct {
	FileName    string    `bson:"file_name" json:"fileName"`
	FileURL     string    `bson:"file_url" json:"fileUrl"`
	FileSize    int64     `bson:"file_size" json:"fileSize"`
	ContentType string    `bson:"content_type" json:"contentType"`
	UploadedAt  time.Time `bson:"uploaded_at" json:"uploadedAt"`
}

type LoginRequest struct {
	Mobile string `json:"mobile" binding:"required"`
	OTP    string `json:"otp" binding:"required"`
}

type SignupRequest struct {
	Mobile           string `json:"mobile" binding:"required"`
	Name             string `json:"name" binding:"required"`
	AadharNumber     string `json:"aadharNumber" binding:"required"`
	LicenseNumber    string `json:"licenseNumber" binding:"required"`
	VehicleNumber    string `json:"vehicleNumber" binding:"required"`
	EmergencyContact string `json:"emergencyContact" binding:"required"`
}
