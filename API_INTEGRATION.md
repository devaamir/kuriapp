# API Integration Documentation

## Overview
This React Native app is integrated with a backend API running at `http://192.168.1.24:3000`.

## Features Implemented

### 1. Authentication Service (`src/services/authService.ts`)
- **JWT Token Management**: Secure storage using AsyncStorage
- **Automatic Token Injection**: Axios interceptor adds Bearer token to protected routes
- **Input Validation**: Email format and password length validation
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 2. API Functions
- `register(name, email, password)` - User registration
- `login(email, password)` - User login
- `getProfile()` - Get user profile (protected)
- `updateProfile(name, email)` - Update user profile (protected)
- `logout()` - Clear stored token

### 3. Screen Integration

#### LoginScreen
- Form validation (email format, password length ≥ 6)
- Loading states during API calls
- Error handling with alerts
- Automatic navigation to main app on success

#### SignupScreen
- Form validation including password confirmation
- Loading states during API calls
- Error handling with alerts
- Automatic navigation to main app on success

#### ProfileScreen
- Logout functionality with token cleanup
- Navigation back to login screen

### 4. Navigation
- **Authentication Check**: App automatically checks for stored token on startup
- **Protected Routes**: Main app screens require authentication
- **Automatic Redirects**: Users are redirected to login if not authenticated

### 5. Additional Features
- **useProfile Hook**: Custom hook for profile management
- **Loading Indicators**: Visual feedback during API calls
- **Error Messages**: User-friendly error handling
- **Token Persistence**: JWT tokens persist across app restarts

## Usage Examples

### Basic API Calls
```typescript
import { login, register, getProfile } from '../services/authService';

// Login
const response = await login('user@example.com', 'password123');

// Register
const response = await register('John Doe', 'john@example.com', 'password123');

// Get Profile (requires authentication)
const profile = await getProfile();
```

### Using the Profile Hook
```typescript
import { useProfile } from '../hooks/useProfile';

const MyComponent = () => {
  const { user, loading, error, updateUserProfile } = useProfile();
  
  const handleUpdate = async () => {
    const success = await updateUserProfile('New Name', 'new@email.com');
    if (success) {
      // Profile updated successfully
    }
  };
};
```

## Security Features
- JWT tokens stored securely in AsyncStorage
- Automatic token cleanup on logout
- Protected routes require valid authentication
- Input validation prevents malformed requests

## Error Handling
- Network errors are caught and displayed to users
- API error responses are parsed and shown as alerts
- Loading states prevent multiple simultaneous requests
- Form validation prevents invalid data submission
