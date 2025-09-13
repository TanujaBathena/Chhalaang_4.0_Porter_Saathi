# Backend Integration Guide

This guide explains how the Porter Saathi frontend has been integrated with the backend API while maintaining UI stability and fallback mechanisms.

## Overview

The integration provides seamless connectivity between the React frontend and Go backend while ensuring the UI remains functional even when the backend is unavailable.

## Key Features

### 1. **Centralized API Service** (`src/utils/apiService.js`)
- Single point of communication with backend
- Automatic token management
- Error handling with graceful fallbacks
- Support for all backend endpoints

### 2. **Authentication Integration**
- **Login**: Real OTP sending and verification
- **Signup**: Complete user registration with backend
- **Token Management**: Automatic JWT handling
- **Persistent Sessions**: User data stored locally

### 3. **Data Integration with Fallbacks**
- **Tutorials**: Backend data with mock data fallback
- **Earnings**: Real earnings tracking with mock fallback
- **Chat**: Backend AI chat with direct API fallback

### 4. **Error Handling**
- React Error Boundary for crash protection
- API error handling with user-friendly messages
- Automatic fallback to mock data when backend unavailable

## Integration Points

### Authentication Flow
```javascript
// Login Process
1. User enters mobile number
2. Frontend calls apiService.sendOTP(mobile)
3. Backend generates and returns OTP
4. User enters OTP
5. Frontend calls apiService.login(mobile, otp)
6. Backend validates and returns JWT + user data
7. Frontend stores token and user data locally
```

### Data Hooks
- `useTutorials()`: Manages tutorial data with backend integration
- `useEarnings()`: Handles earnings with real-time backend sync
- `useUser()`: Provides user context throughout the app

### Chat Integration
- Authenticated users get backend AI responses
- Unauthenticated users fall back to direct Gemini API
- Chat history stored in backend for authenticated users

## Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

### Backend Requirements
The backend should be running on `http://localhost:8080` with the following endpoints:
- `POST /api/v1/auth/send-otp`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/signup`
- `GET /api/v1/tutorials`
- `GET /api/v1/earnings`
- `POST /api/v1/earnings`
- `POST /api/v1/chat/message`

## Fallback Mechanisms

### 1. **API Unavailable**
- All API calls have try-catch blocks
- Automatic fallback to mock data
- User-friendly error messages
- UI remains fully functional

### 2. **Authentication Failures**
- Automatic token refresh attempts
- Graceful logout on persistent auth failures
- Redirect to login when needed

### 3. **Network Issues**
- Retry mechanisms for critical operations
- Offline-friendly UI states
- Error boundaries prevent crashes

## Testing the Integration

### 1. **With Backend Running**
```bash
# Start backend
cd backend
docker-compose up -d

# Start frontend
npm start
```

### 2. **Without Backend (Fallback Mode)**
```bash
# Just start frontend
npm start
# All features work with mock data
```

### 3. **Test Scenarios**
- [ ] Login with real OTP
- [ ] Signup new user
- [ ] View tutorials (backend + fallback)
- [ ] Track earnings (backend + fallback)
- [ ] Chat functionality (backend + fallback)
- [ ] Logout and session management

## File Structure

```
src/
├── utils/
│   └── apiService.js          # Centralized API communication
├── hooks/
│   ├── useTutorials.js        # Tutorial data management
│   ├── useEarnings.js         # Earnings data management
│   └── useUser.js             # User context hook
├── contexts/
│   └── UserContext.js         # User state management
├── components/
│   └── ErrorBoundary.js       # Error handling
└── data/
    └── mockData.js            # Fallback data
```

## Benefits

### 1. **Seamless User Experience**
- No breaking changes to existing UI
- Smooth transitions between backend and fallback modes
- Consistent behavior regardless of backend status

### 2. **Developer Experience**
- Easy to test with or without backend
- Clear separation of concerns
- Comprehensive error handling

### 3. **Production Ready**
- Robust error handling
- Graceful degradation
- Performance optimized with proper loading states

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3000`
   - Check backend environment variables

2. **Authentication Issues**
   - Clear localStorage: `localStorage.clear()`
   - Check JWT token validity
   - Verify backend auth endpoints

3. **API Connection Issues**
   - Verify `REACT_APP_API_URL` in `.env`
   - Check backend is running on correct port
   - Review network tab in browser dev tools

### Debug Mode
Enable debug logging by adding to localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

## Next Steps

1. **Document Upload**: Implement file upload for user documents
2. **Real-time Updates**: Add WebSocket support for live data
3. **Offline Support**: Implement service worker for offline functionality
4. **Performance**: Add caching layers for frequently accessed data

## Support

For issues or questions about the integration:
1. Check browser console for error messages
2. Verify backend logs for API issues
3. Test with mock data to isolate frontend issues
4. Review this guide for configuration steps 