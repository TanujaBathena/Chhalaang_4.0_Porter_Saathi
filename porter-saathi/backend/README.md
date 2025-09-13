# Porter Saathi Backend

A Go-based REST API backend for the Porter Saathi mobile application, built with Gin framework and MongoDB.

## Features

- **User Authentication**: OTP-based login/signup system
- **JWT Authorization**: Secure API endpoints with JWT tokens
- **Document Upload**: File upload handling for user documents
- **Earnings Tracking**: Daily and weekly earnings management
- **AI Chat Integration**: Gemini AI-powered chat system
- **Multi-language Support**: Hindi, English, Telugu, Tamil
- **Tutorial Management**: Educational content management

## Tech Stack

- **Framework**: Gin (Go)
- **Database**: MongoDB
- **Authentication**: JWT
- **AI Integration**: Google Gemini API
- **File Storage**: Local file system
- **Containerization**: Docker & Docker Compose

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # HTTP request handlers
├── middleware/      # Authentication middleware
├── models/          # Data models and structures
├── routes/          # API route definitions
├── utils/           # Utility functions and database seeder
├── uploads/         # File upload directory
├── main.go          # Application entry point
├── Dockerfile       # Docker configuration
└── docker-compose.yml # Docker Compose setup
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to mobile number
- `POST /api/v1/auth/login` - Login with mobile and OTP
- `POST /api/v1/auth/signup` - User registration

### User Management (Protected)
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/user/upload-document` - Upload user documents

### Earnings (Protected)
- `GET /api/v1/earnings` - Get earnings summary
- `POST /api/v1/earnings` - Add earnings record

### Chat (Protected)
- `POST /api/v1/chat/message` - Send message to AI
- `GET /api/v1/chat/history/:sessionId` - Get chat history

### Tutorials (Public)
- `GET /api/v1/tutorials` - Get all tutorials
- `GET /api/v1/tutorials/:id` - Get specific tutorial
- `GET /api/v1/tutorials/category/:category` - Get tutorials by category

## Quick Start

### Prerequisites
- Go 1.21+
- MongoDB 7.0+
- Docker (optional)

### Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/porter_saathi
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_here
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:3000
```

### Running with Docker (Recommended)

1. **Start the services**:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Check logs**:
   ```bash
   docker-compose logs -f backend
   ```

3. **Stop services**:
   ```bash
   docker-compose down
   ```

### Running Locally

1. **Install dependencies**:
   ```bash
   cd backend
   go mod tidy
   ```

2. **Start MongoDB** (if not using Docker):
   ```bash
   mongod --dbpath /path/to/your/db
   ```

3. **Run the application**:
   ```bash
   go run main.go
   ```

4. **Seed the database** (optional):
   The application will automatically seed tutorial data on first run.

## Development

### Adding New Endpoints

1. **Create model** in `models/` directory
2. **Add controller** in `controllers/` directory
3. **Register route** in `routes/routes.go`
4. **Add middleware** if authentication is required

### Database Schema

#### Users Collection
```json
{
  "_id": "ObjectId",
  "mobile": "string",
  "name": "string",
  "aadhar_number": "string",
  "license_number": "string",
  "vehicle_number": "string",
  "emergency_contact": "string",
  "preferred_language": "string",
  "documents": {
    "aadhar_card": "DocumentFile",
    "driving_license": "DocumentFile",
    "vehicle_rc": "DocumentFile",
    "profile_photo": "DocumentFile"
  },
  "is_verified": "boolean",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Earnings Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "date": "timestamp",
  "revenue": "number",
  "expenses": "number",
  "trips": "number",
  "net_earnings": "number",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:8080/health

# Send OTP
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'

# Get tutorials
curl http://localhost:8080/api/v1/tutorials
```

## Integration with Frontend

The backend is designed to work seamlessly with the existing React frontend. Key integration points:

1. **CORS Configuration**: Allows requests from `http://localhost:3000`
2. **API Structure**: Matches the data structures used in frontend mockData
3. **Multi-language Support**: Supports the same languages as the frontend
4. **File Upload**: Handles document uploads from the signup process

## Production Deployment

1. **Set production environment variables**
2. **Use a production MongoDB instance**
3. **Configure proper CORS origins**
4. **Set up file storage (AWS S3, etc.)**
5. **Enable HTTPS**
6. **Set up monitoring and logging**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Porter Saathi application. 