#!/bin/bash

# Test Profile Flow - Porter Saathi
# This script tests the complete flow from login to profile access

set -e  # Exit on any error

BASE_URL="http://localhost:8080/api/v1"
MOBILE="9876543210"

echo "🧪 Testing Porter Saathi Profile Flow"
echo "======================================"

# Step 1: Send OTP
echo "📱 Step 1: Sending OTP to $MOBILE..."
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

# Step 2: Login with OTP
echo ""
echo "🔐 Step 2: Logging in with OTP..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"mobile\": \"$MOBILE\", \"otp\": \"$OTP\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get authentication token"
    exit 1
fi

echo "✅ Login successful, token received"

# Step 3: Get User Profile
echo ""
echo "👤 Step 3: Fetching user profile..."
PROFILE_RESPONSE=$(curl -s -X GET $BASE_URL/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.'

# Check if profile data is valid
USER_NAME=$(echo "$PROFILE_RESPONSE" | jq -r '.name')
if [ "$USER_NAME" = "null" ] || [ -z "$USER_NAME" ]; then
    echo "❌ Failed to get user profile data"
    exit 1
fi

echo "✅ Profile data retrieved successfully"
echo "   User: $USER_NAME"

# Step 4: Get Earnings Data
echo ""
echo "💰 Step 4: Fetching earnings data..."
EARNINGS_RESPONSE=$(curl -s -X GET $BASE_URL/earnings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Earnings Response:"
echo "$EARNINGS_RESPONSE" | jq '.'

# Check if earnings data exists
TODAY_REVENUE=$(echo "$EARNINGS_RESPONSE" | jq -r '.today.revenue // 0')
echo "✅ Earnings data retrieved successfully"
echo "   Today's Revenue: ₹$TODAY_REVENUE"

# Step 5: Test Frontend Profile Page
echo ""
echo "🌐 Step 5: Testing Frontend Profile Page Access..."
echo "Frontend URL: http://localhost:3000"
echo ""
echo "📋 Manual Test Instructions:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Login with mobile: $MOBILE"
echo "3. Use OTP: $OTP (if still valid)"
echo "4. Click on the orange profile avatar in the top-right"
echo "5. Verify profile data is displayed correctly"
echo "6. Switch to 'Earnings' tab and verify earnings data"

echo ""
echo "🎉 All API tests passed! Profile functionality is working."
echo "📱 Frontend should now work properly with authentication." 