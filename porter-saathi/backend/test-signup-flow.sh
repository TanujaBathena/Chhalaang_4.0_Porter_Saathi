#!/bin/bash

# Test Signup Flow - Porter Saathi
# This script tests the complete signup flow

set -e  # Exit on any error

BASE_URL="http://localhost:8080/api/v1"
MOBILE="9999888777"  # Use a different number for signup test

echo "🧪 Testing Porter Saathi Signup Flow"
echo "====================================="

# Step 1: Send OTP for Signup
echo "📱 Step 1: Sending OTP for signup to $MOBILE..."
OTP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"mobile\": \"$MOBILE\"}")

echo "OTP Response:"
echo "$OTP_RESPONSE" | jq '.'

# Extract OTP from response
OTP=$(echo "$OTP_RESPONSE" | jq -r '.otp')
if [ "$OTP" = "null" ] || [ -z "$OTP" ]; then
    echo "❌ Failed to get OTP"
    exit 1
fi

echo "✅ OTP received: $OTP"

# Step 2: Test Signup API
echo ""
echo "📝 Step 2: Testing signup API..."
SIGNUP_DATA='{
  "mobile": "'$MOBILE'",
  "name": "Test Driver",
  "aadharNumber": "123456789999",
  "licenseNumber": "TEST123456789",
  "vehicleNumber": "TEST1234",
  "emergencyContact": "9999888888"
}'

echo "Signup Data:"
echo "$SIGNUP_DATA" | jq '.'

SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d "$SIGNUP_DATA")

echo "Signup Response:"
echo "$SIGNUP_RESPONSE" | jq '.'

# Check if signup was successful
TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token')
USER_NAME=$(echo "$SIGNUP_RESPONSE" | jq -r '.user.name')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Signup failed - no token received"
    echo "Response: $SIGNUP_RESPONSE"
    exit 1
fi

echo "✅ Signup successful!"
echo "   User: $USER_NAME"
echo "   Token received: ${TOKEN:0:20}..."

# Step 3: Test Profile Access with New User
echo ""
echo "👤 Step 3: Testing profile access with new user..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.'

# Verify profile data
PROFILE_NAME=$(echo "$PROFILE_RESPONSE" | jq -r '.name')
if [ "$PROFILE_NAME" = "null" ] || [ -z "$PROFILE_NAME" ]; then
    echo "❌ Failed to get profile data"
    exit 1
fi

echo "✅ Profile access successful!"
echo "   Profile Name: $PROFILE_NAME"

# Step 4: Test Login with New User
echo ""
echo "🔐 Step 4: Testing login with new user..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"mobile\": \"$MOBILE\", \"otp\": \"$OTP\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$LOGIN_TOKEN" = "null" ] || [ -z "$LOGIN_TOKEN" ]; then
    echo "❌ Login failed after signup"
    exit 1
fi

echo "✅ Login successful after signup!"

echo ""
echo "🎉 All signup tests passed!"
echo "📱 Frontend signup should now work properly."
echo ""
echo "📋 Frontend Test Instructions:"
echo "1. Open http://localhost:3000"
echo "2. Click 'Sign Up Here' link"
echo "3. Enter mobile: $MOBILE"
echo "4. Use OTP: $OTP (if still valid)"
echo "5. Fill driver details and complete signup"
echo "6. Should automatically login and show main app"
echo "7. Click profile avatar to verify profile data" 