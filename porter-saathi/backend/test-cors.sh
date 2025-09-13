#!/bin/bash

echo "🔍 Testing CORS Configuration"
echo "============================="

# Test 1: Check if backend is running
echo "1. Testing backend availability..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/tutorials)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not responding (status: $BACKEND_STATUS)"
    exit 1
fi

# Test 2: Test CORS with port 3000 (original)
echo ""
echo "2. Testing CORS with port 3000..."
CORS_3000=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    http://localhost:8080/api/v1/auth/send-otp)

echo "   OPTIONS request status: $CORS_3000"

# Test 3: Test CORS with port 3001 (new)
echo ""
echo "3. Testing CORS with port 3001..."
CORS_3001=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:3001" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type" \
    http://localhost:8080/api/v1/auth/send-otp)

echo "   OPTIONS request status: $CORS_3001"

# Test 4: Test actual POST request with port 3001
echo ""
echo "4. Testing actual POST request with port 3001..."
POST_3001=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Origin: http://localhost:3001" \
    -H "Content-Type: application/json" \
    -d '{"mobile": "9123456789"}' \
    http://localhost:8080/api/v1/auth/send-otp)

echo "   POST request status: $POST_3001"

# Test 5: Test without Origin header
echo ""
echo "5. Testing without Origin header..."
NO_ORIGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"mobile": "9123456789"}' \
    http://localhost:8080/api/v1/auth/send-otp)

echo "   POST without Origin status: $NO_ORIGIN"

echo ""
echo "📋 CORS Test Summary:"
echo "===================="
if [ "$CORS_3000" = "200" ] || [ "$CORS_3000" = "204" ]; then
    echo "✅ Port 3000: Working"
else
    echo "❌ Port 3000: Failed ($CORS_3000)"
fi

if [ "$CORS_3001" = "200" ] || [ "$CORS_3001" = "204" ]; then
    echo "✅ Port 3001: Working"
else
    echo "❌ Port 3001: Failed ($CORS_3001)"
fi

if [ "$POST_3001" = "200" ]; then
    echo "✅ POST requests: Working"
else
    echo "❌ POST requests: Failed ($POST_3001)"
fi

echo ""
echo "💡 Expected CORS headers for successful requests:"
echo "   Access-Control-Allow-Origin: http://localhost:3001"
echo "   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"
echo "   Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization" 