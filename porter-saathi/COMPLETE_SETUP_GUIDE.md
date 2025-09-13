# Porter Saathi - Complete Setup Guide

This guide will help you set up and run the complete Porter Saathi application with backend integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- Go (v1.19 or higher)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd porter-saathi
npm install
```

### 2. Start MongoDB
```bash
cd backend
docker-compose up -d mongodb
```

### 3. Seed Database with Test Data
```bash
cd backend
docker-compose exec -T mongodb mongosh -u admin -p password123 --authenticationDatabase admin < scripts/seed_data.js
```

### 4. Start Backend
```bash
cd backend
go run main.go
```

### 5. Start Frontend (in new terminal)
```bash
cd porter-saathi
npm start
```

### 6. Test Complete Flow
```bash
cd backend
./test-full-flow.sh
```

## 🎯 Testing the Application

### Test User Credentials
- **Mobile**: 9876543210 (Rajesh Kumar - Verified)
- **Mobile**: 9123456789 (Suresh Patel - Verified)  
- **Mobile**: 8765432109 (Ramesh Singh - Not Verified)

### Login Process
1. Visit http://localhost:3000
2. Enter mobile number: `9876543210`
3. Click "Send OTP"
4. Check backend logs for the generated OTP
5. Enter the OTP and login

### Features to Test

#### ✅ Authentication
- [x] OTP generation and login
- [x] JWT token management
- [x] Auto-login on app reload
- [x] Logout functionality

#### ✅ Profile Management
- [x] View complete user profile
- [x] Document status display
- [x] Account information
- [x] Verification status

#### ✅ Earnings Dashboard
- [x] Today's earnings display
- [x] Weekly earnings summary
- [x] Revenue, expenses, and trips breakdown
- [x] Real-time data from backend

#### ✅ Chat Integration
- [x] AI chat with backend integration
- [x] Fallback to direct Gemini API
- [x] Session management
- [x] Multi-language support

#### ✅ Tutorials
- [x] Backend tutorial fetching
- [x] Fallback to mock data
- [x] Category-based filtering

## 📱 Application Flow

### 1. Language Selection
- Choose preferred language (Hindi/English)
- Sets up voice and text translations

### 2. Authentication
- Enter mobile number
- Receive OTP (check backend logs)
- Login with OTP
- JWT token stored locally

### 3. Home Dashboard
- View today's earnings
- Access voice commands
- Navigate to different sections

### 4. Profile Section
- **Profile Tab**: Personal info, documents, account details
- **Earnings Tab**: Detailed earnings breakdown
- Real-time data from backend with fallbacks

### 5. Guru Section
- Browse tutorials by category
- AI-powered chat assistance
- Emergency support features

### 6. Suraksha (Safety)
- Emergency contacts
- Safety guidelines
- Quick access features

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Generate OTP
- `POST /api/v1/auth/login` - Login with OTP
- `POST /api/v1/auth/signup` - User registration

### User Management
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update profile
- `POST /api/v1/user/upload-document` - Upload documents

### Earnings
- `GET /api/v1/earnings/` - Get earnings summary
- `POST /api/v1/earnings` - Add earnings record

### Tutorials
- `GET /api/v1/tutorials` - Get all tutorials
- `GET /api/v1/tutorials/:id` - Get specific tutorial
- `GET /api/v1/tutorials/category/:category` - Get by category

### Chat
- `POST /api/v1/chat/message` - Send chat message

## 🗄️ Database Structure

### Collections
- **users** - User profiles and documents
- **earnings** - Daily earnings records
- **tutorials** - Tutorial content
- **chat_sessions** - Chat history
- **otps** - OTP verification codes

### Sample Data
The database is seeded with:
- 3 test users with complete profiles
- 90 earnings records (30 days × 3 users)
- 2 chat sessions with message history
- Active OTP codes for testing

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check if MongoDB is running
docker-compose ps

# View backend logs
go run main.go

# Test API endpoints
./test-full-flow.sh
```

### Frontend Issues
```bash
# Check if backend is accessible
curl http://localhost:8080/api/v1/health

# Restart frontend
npm start
```

### Database Issues
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Check data
use porter_saathi
db.users.countDocuments()
db.earnings.countDocuments()
```

## 🎨 Key Features

### 🔄 Fallback Mechanism
- Frontend works even if backend is down
- Graceful degradation to mock data
- Error boundaries prevent crashes

### 🌐 Multi-language Support
- Hindi and English translations
- Voice synthesis in multiple languages
- Cultural context awareness

### 📱 Mobile-First Design
- Responsive UI components
- Touch-friendly interactions
- Optimized for mobile screens

### 🔐 Security
- JWT-based authentication
- Secure OTP generation
- Protected API endpoints

### 🎯 Real-time Features
- Live earnings updates
- Chat session management
- Voice command integration

## 📊 Performance

### Backend
- Go Gin framework for high performance
- MongoDB for scalable data storage
- JWT for stateless authentication

### Frontend
- React with hooks for state management
- Custom hooks for data fetching
- Optimized re-rendering

### Integration
- Centralized API service
- Error handling and retries
- Caching strategies

## 🚀 Production Deployment

### Environment Variables
```env
# Backend (.env)
PORT=8080
MONGODB_URI=mongodb://admin:password123@localhost:27017/porter_saathi?authSource=admin
JWT_SECRET=your_production_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (.env)
REACT_APP_API_URL=https://your-backend-domain.com/api/v1
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 📞 Support

### Test Credentials
- Mobile: 9876543210
- Use dynamically generated OTP from backend logs

### API Testing
```bash
# Run comprehensive test
./backend/test-full-flow.sh

# Individual endpoint testing
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

---

## 🎉 Success Checklist

- [ ] MongoDB running and populated
- [ ] Backend API responding
- [ ] Frontend loading at http://localhost:3000
- [ ] Login working with test credentials
- [ ] Profile page showing real data
- [ ] Earnings displaying from backend
- [ ] Chat functionality working
- [ ] Voice features operational

**🚀 Your Porter Saathi application is now fully integrated and ready to use!** 