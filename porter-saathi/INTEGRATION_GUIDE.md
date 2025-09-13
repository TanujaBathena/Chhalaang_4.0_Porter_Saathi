# Porter Saathi Frontend-Backend Integration Guide

This guide shows how to integrate your existing React frontend with the new Go backend and MongoDB database.

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/REST API    ┌──────────────────┐    MongoDB    ┌─────────────┐
│   React Frontend │ ◄─────────────────► │   Go Backend     │ ◄───────────► │   MongoDB   │
│   (Port 3000)    │                     │   (Port 8080)    │               │ (Port 27017)│
└─────────────────┘                     └──────────────────┘               └─────────────┘
```

## 🚀 Quick Start

### 1. Start the Backend Services

```bash
# Option 1: Using Docker (Recommended)
cd backend
docker-compose up -d

# Option 2: Manual setup
# Start MongoDB
mongod --dbpath /path/to/your/db

# Start Go backend
cd backend
go run main.go
```

### 2. Start the React Frontend

```bash
# In the root directory
npm start
```

## 🔧 Frontend Integration Changes

### Step 1: Update API Base URL

Create or update `src/config/api.js`:

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = {
  baseURL: API_BASE_URL,
  
  // Helper method for authenticated requests
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
};
```

### Step 2: Update Authentication Logic

Replace the mock authentication in your components:

```javascript
// src/services/authService.js
import { apiClient } from '../config/api';

export const authService = {
  // Send OTP
  sendOTP: async (mobile) => {
    return apiClient.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  // Login with OTP
  login: async (mobile, otp) => {
    const response = await apiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Signup
  signup: async (userData) => {
    const response = await apiClient.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};
```

### Step 3: Update Data Services

Replace mock data calls with real API calls:

```javascript
// src/services/dataService.js
import { apiClient } from '../config/api';

export const dataService = {
  // Get tutorials
  getTutorials: async () => {
    return apiClient.request('/tutorials');
  },

  // Get earnings
  getEarnings: async () => {
    return apiClient.request('/earnings');
  },

  // Add earnings
  addEarnings: async (earningsData) => {
    return apiClient.request('/earnings', {
      method: 'POST',
      body: JSON.stringify(earningsData),
    });
  },

  // Send chat message
  sendChatMessage: async (message, sessionType = 'general', language = 'en', sessionId) => {
    const endpoint = sessionId ? `/chat/message?sessionId=${sessionId}` : '/chat/message';
    return apiClient.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionType,
        language,
      }),
    });
  },

  // Upload document
  uploadDocument: async (file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${apiClient.baseURL}/user/upload-document`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
};
```

### Step 4: Update Components

#### Update LoginPage.js

```javascript
// In src/components/LoginPage.js
import { authService } from '../services/authService';

// Replace the mock OTP logic with:
const handleSendOTP = async () => {
  try {
    setIsLoading(true);
    const response = await authService.sendOTP(mobileNumber);
    setOtpSent(true);
    speak(t('otpSent'));
  } catch (error) {
    setError('Failed to send OTP');
    speak('Failed to send OTP');
  } finally {
    setIsLoading(false);
  }
};

const handleLogin = async () => {
  try {
    setIsLoading(true);
    await authService.login(mobileNumber, otp);
    onLogin(true);
  } catch (error) {
    setError('Invalid OTP');
    speak('Invalid OTP');
  } finally {
    setIsLoading(false);
  }
};
```

#### Update SignupPage.js

```javascript
// In src/components/SignupPage.js
import { authService } from '../services/authService';

// Replace the mock signup logic with:
const handleCompleteSignup = async () => {
  try {
    setIsLoading(true);
    await authService.signup({
      mobile: mobileNumber,
      name: driverDetails.name,
      aadharNumber: driverDetails.aadharNumber,
      licenseNumber: driverDetails.licenseNumber,
      vehicleNumber: driverDetails.vehicleNumber,
      emergencyContact: driverDetails.emergencyContact,
    });
    
    const successMsg = t('signupSuccess');
    speak(successMsg);
    onSignupComplete();
  } catch (error) {
    setError('Signup failed');
    speak('Signup failed');
  } finally {
    setIsLoading(false);
  }
};
```

#### Update HomePage.js

```javascript
// In src/components/pages/HomePage.js
import { dataService } from '../../services/dataService';

// Replace MOCK_DATA usage with:
const [earnings, setEarnings] = useState(null);

useEffect(() => {
  const fetchEarnings = async () => {
    try {
      const data = await dataService.getEarnings();
      setEarnings(data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      // Fallback to mock data if needed
      setEarnings(MOCK_DATA.earnings);
    }
  };

  fetchEarnings();
}, []);

// Use earnings?.today instead of MOCK_DATA.earnings.today
const { revenue, expenses, trips } = earnings?.today || { revenue: 0, expenses: 0, trips: 0 };
```

#### Update Chat Components

```javascript
// In your chat components
import { dataService } from '../../services/dataService';

const handleSendMessage = async (message) => {
  try {
    setIsLoading(true);
    const response = await dataService.sendChatMessage(
      message,
      page === 'guru-chat' ? 'guru' : 'general',
      language,
      currentSessionId
    );
    
    setChatHistory(response.messages);
    setCurrentSessionId(response.sessionId);
    generateAndPlayAudio(response.response);
  } catch (error) {
    console.error('Chat error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## 🔄 Migration Strategy

### Phase 1: Parallel Operation
1. Keep existing mock data as fallback
2. Add API calls with error handling
3. Test both systems side by side

### Phase 2: Gradual Migration
1. Start with non-critical features (tutorials)
2. Move to authentication
3. Finally migrate earnings and chat

### Phase 3: Full Migration
1. Remove mock data
2. Clean up unused code
3. Add proper error handling

## 🧪 Testing the Integration

### 1. Test Backend API

```bash
cd backend
./test-api.sh
```

### 2. Test Frontend Integration

1. Start both backend and frontend
2. Try the signup flow
3. Test login with OTP
4. Verify earnings display
5. Test chat functionality

### 3. Error Handling

Add proper error boundaries and loading states:

```javascript
// src/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## 🔐 Environment Variables

Add to your `.env` file in the React app root:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_UPLOAD_URL=http://localhost:8080/uploads
```

## 📱 Production Considerations

1. **HTTPS**: Use HTTPS in production
2. **CORS**: Update CORS origins for production domains
3. **Error Handling**: Add comprehensive error handling
4. **Loading States**: Show loading indicators
5. **Offline Support**: Add service worker for offline functionality
6. **File Storage**: Move to cloud storage (AWS S3, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS configuration
2. **Authentication Failures**: Verify JWT token handling
3. **File Upload Issues**: Check file size limits and types
4. **Database Connection**: Ensure MongoDB is running

### Debug Steps

1. Check browser network tab
2. Check backend logs
3. Verify environment variables
4. Test API endpoints directly

## 📚 Next Steps

1. Add comprehensive error handling
2. Implement offline support
3. Add data caching
4. Set up monitoring and analytics
5. Add automated testing

Your Porter Saathi app now has a robust backend with MongoDB! The existing frontend code will continue to work while you gradually migrate to the new API endpoints. 