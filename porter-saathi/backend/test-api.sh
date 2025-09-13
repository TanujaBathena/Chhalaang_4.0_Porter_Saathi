#!/bin/bash

# Porter Saathi Backend API Test Script

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/v1"

echo "🚀 Testing Porter Saathi Backend API"
echo "======================================"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test tutorials endpoint (public)
echo "2. Testing tutorials endpoint..."
curl -s "$API_URL/tutorials" | jq '.[0]'
echo ""

# Test send OTP
echo "3. Testing send OTP..."
OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}')
echo "$OTP_RESPONSE" | jq '.'

# Extract OTP from response (for demo purposes)
OTP=$(echo "$OTP_RESPONSE" | jq -r '.otp')
echo "Generated OTP: $OTP"
echo ""

# Test signup
echo "4. Testing signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "name": "Test Driver",
    "aadharNumber": "123456789012",
    "licenseNumber": "DL1234567890",
    "vehicleNumber": "MH01AB1234",
    "emergencyContact": "9876543211"
  }')
echo "$SIGNUP_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token')
echo "JWT Token: ${TOKEN:0:50}..."
echo ""

# Test protected endpoint - get profile
echo "5. Testing protected endpoint - get profile..."
curl -s "$API_URL/user/profile" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test add earnings
echo "6. Testing add earnings..."
curl -s -X POST "$API_URL/earnings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "revenue": 1500,
    "expenses": 400,
    "trips": 10
  }' | jq '.'
echo ""

# Test get earnings
echo "7. Testing get earnings..."
curl -s "$API_URL/earnings" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ API testing completed!" 