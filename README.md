# Porter Saathi 🚛

**Porter Saathi** (पोर्टर साथी) is a comprehensive digital companion platform designed specifically for truck drivers and logistics partners. The application provides multilingual support, voice-enabled interactions, earnings tracking, and educational resources to empower drivers in their daily operations.

## 🌟 Features

### Core Functionality
- **🗣️ Voice-Enabled AI Assistant**: Interactive voice commands and responses in multiple languages
- **💰 Earnings Tracking**: Real-time tracking of daily and weekly earnings, expenses, and trips
- **📚 Educational Content**: Tutorial videos and learning resources for drivers
- **🛡️ Safety & Security (Suraksha)**: Safety guidelines and emergency features
- **👤 Profile Management**: Complete user profile with document management
- **🌍 Multilingual Support**: Available in English, Hindi, Telugu, and Tamil

### Advanced Features
- **📱 OCR Document Processing**: Automatic text extraction from documents using Tesseract.js
- **🎯 Personalized Dashboard**: Customized experience based on user preferences
- **📊 Weekly Progress Tracking**: Visual representation of earnings and performance
- **🔐 Secure Authentication**: JWT-based authentication system
- **📁 Document Upload & Management**: Secure storage for Aadhar, License, and Vehicle RC

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18.2.0 with functional components and hooks
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API and custom hooks
- **Voice Processing**: Web Speech API integration
- **OCR**: Tesseract.js for document text extraction

### Backend (Go)
- **Framework**: Gin web framework
- **Database**: MongoDB with official Go driver
- **Authentication**: JWT tokens
- **File Upload**: Multipart form handling with UUID-based naming
- **API Integration**: Google Gemini AI for intelligent responses

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB 7.0
- **File Storage**: Local filesystem with organized directory structure
- **CORS**: Configured for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Go** (v1.21 or higher)
- **Docker & Docker Compose**
- **MongoDB** (if running locally without Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd porter-saathi
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Install Go dependencies
   go mod download
   
   # Create environment file
   cp .env.example .env
   
   # Update .env with your configurations:
   # - MONGODB_URI
   # - JWT_SECRET
   # - GEMINI_API_KEY
   # - UPLOAD_PATH
   ```

3. **Frontend Setup**
   ```bash
   cd ..  # Back to root directory
   
   # Install Node.js dependencies
   npm install
   ```

4. **Database Setup with Docker**
   ```bash
   cd backend
   
   # Start MongoDB and Backend services
   docker-compose up -d
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start Frontend (from root directory)
   npm start
   
   # Terminal 2: Start Backend (if not using Docker)
   cd backend
   go run main.go
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 📁 Project Structure

```
porter-saathi/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── pages/              # Page components
│   │   ├── LanguageSelection.js
│   │   ├── LoginPage.js
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── data/                   # Static data and translations
│   ├── services/               # API services
│   └── utils/                  # Utility functions
├── backend/                     # Go backend application
│   ├── controllers/            # API controllers
│   ├── models/                 # Data models
│   ├── routes/                 # API routes
│   ├── middleware/             # Authentication middleware
│   ├── config/                 # Database configuration
│   ├── utils/                  # Backend utilities
│   └── uploads/                # File upload directory
├── public/                     # Static assets
└── docs/                       # Documentation files
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload` - Upload documents

### Earnings
- `GET /api/earnings/today` - Get today's earnings
- `GET /api/earnings/weekly` - Get weekly earnings
- `POST /api/earnings` - Add earnings entry

### Tutorials
- `GET /api/tutorials` - Get all tutorials
- `GET /api/tutorials/:id` - Get specific tutorial

### Chat/AI
- `POST /api/chat` - Send message to AI assistant

## 🌐 Multilingual Support

The application supports four languages:
- **English** (en-IN)
- **Hindi** (hi-IN) - हिंदी
- **Telugu** (te-IN) - తెలుగు
- **Tamil** (ta-IN) - தமிழ்

Language selection is persistent across sessions and affects:
- UI text and labels
- Voice synthesis and recognition
- AI assistant responses

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=8080
MONGODB_URI=mongodb://admin:password123@localhost:27017/porter_saathi?authSource=admin
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test API endpoints
./test-api.sh
./test-signup-flow.sh
./test-profile-flow.sh
```

### Frontend Testing
```bash
# Run React tests
npm test
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop browsers
- Tablet devices
- Mobile phones
- Voice-first interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation in the `/docs` folder
- Review the setup guides for specific configurations

## 🚀 Deployment

### Production Deployment
1. Build the frontend: `npm run build`
2. Build the backend: `go build -o porter-saathi-backend`
3. Configure production environment variables
4. Deploy using Docker Compose or your preferred method

### Docker Production
```bash
# Build and run in production mode
docker-compose -f docker-compose.prod.yml up -d
```
### Demo
[![Live Demo 1](https://img.shields.io/badge/Demo-1-green)](https://www.loom.com/share/3668b19817a24e07933d8cb17573e81e?sid=2c1bd88b-30f6-4cdd-8b03-c2f2f1a7bdad)
[![Live Demo 2](https://img.shields.io/badge/Demo-2-blue)](https://www.loom.com/share/9458a72a38004264932a585295bb20e9?sid=fe12a2f8-15d5-4d7d-9948-253c1f78a1e6)
[View Project Presentation] (https://drive.google.com/file/d/1e5CvEV2CGpgQCa6pOeLnS-I1pGZJHbdjf0LsvSjqBnE/view)
---

**Porter Saathi** - Empowering drivers with technology, one journey at a time! 🚛✨
