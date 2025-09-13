#!/bin/bash

# Test script for earnings chat functionality
BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api/v1"

echo "🧪 Testing Porter Saathi AI Assistant Earnings Functionality"
echo "============================================================"

# First, let's send OTP for a test user
echo "1. Sending OTP..."
OTP_RESPONSE=$(curl -s -X POST "$API_URL/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210"
  }')

echo "OTP response: $OTP_RESPONSE"

# Extract OTP from backend logs (in real scenario, user would receive via SMS)
echo "2. Please check backend logs for OTP, then enter it:"
read -p "Enter OTP: " OTP

# Now login with mobile and OTP
echo "3. Testing user login with OTP..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"mobile\": \"9876543210\",
    \"otp\": \"$OTP\"
  }")

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token. Check if user exists and OTP is correct."
  exit 1
fi

echo "✅ Got authentication token: ${TOKEN:0:20}..."

# Test earnings endpoint first
echo ""
echo "2. Testing earnings endpoint..."
EARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/earnings/" \
  -H "Authorization: Bearer $TOKEN")

echo "Earnings response: $EARNINGS_RESPONSE"

# Test chat with earnings query
echo ""
echo "3. Testing AI chat with earnings query..."
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "What are my earnings today?",
    "sessionType": "general",
    "language": "en"
  }')

echo "Chat response: $CHAT_RESPONSE"

# Test another earnings query
echo ""
echo "4. Testing weekly earnings query..."
WEEKLY_CHAT_RESPONSE=$(curl -s -X POST "$API_URL/chat/message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "How much did I earn this week?",
    "sessionType": "general", 
    "language": "en"
  }')

echo "Weekly chat response: $WEEKLY_CHAT_RESPONSE"

echo ""
echo "✅ Test completed!" 