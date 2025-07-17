# 🔐 Rural Share Server - User Authentication Guide

## 🎯 **What You'll Learn**
- How to register new users (farmers, SHGs, FPOs)
- How to log users in and get authentication tokens
- How to access protected features with JWT tokens
- How to handle authentication errors gracefully
- Best practices for secure authentication

---

## 📝 **Step 1: User Registration**

### **🌾 Register a Farmer (Individual User)**

```bash
# Create a new farmer account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "राम कुमार (Ram Kumar)",
    "email": "ram.kumar@example.com",
    "password": "FarmLife123!",
    "role": "individual"
  }'
```

**Expected Response:**
```json
{
  "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "राम कुमार (Ram Kumar)",
  "email": "ram.kumar@example.com",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### **👥 Register a Self Help Group (SHG)**

```bash
# Create a new SHG account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "महिला सहायता समूह (Women Support Group)",
    "email": "women.shg@village.com",
    "password": "Together2024!",
    "role": "SHG"
  }'
```

### **🏢 Register a Farmer Producer Organization (FPO)**

```bash
# Create a new FPO account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "पंजाब कृषक उत्पादक संगठन (Punjab Farmer Producer Org)",
    "email": "admin@punjabfpo.org",
    "password": "FPOStrong2024!",
    "role": "FPO"
  }'
```

### **⚙️ Register an Admin User**

```bash
# Create admin account (usually done once)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Administrator",
    "email": "admin@ruralshare.com",
    "password": "AdminSecure2024!",
    "role": "admin"
  }'
```

---

## 🔑 **Step 2: User Login**

### **Simple Login Process**

```bash
# Login any user with their email and password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ram.kumar@example.com",
    "password": "FarmLife123!"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhbS5rdW1hckBleGFtcGxlLmNvbSIsInN1YiI6IjY1ZjFhMmIzYzRkNWU2ZjdnOGg5aTBqMSIsImlhdCI6MTcwNTMyMDAwMCwiZXhwIjoxNzA1NDA2NDAwfQ.signature_here"
}
```

### **💾 Save This Token - It's Your Digital Key!**

```javascript
// In your frontend app, save the token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ram.kumar@example.com', password: 'FarmLife123!' })
});

const { access_token } = await loginResponse.json();

// Store token in localStorage (for web apps)
localStorage.setItem('auth_token', access_token);

// Or store in secure storage (for mobile apps)
SecureStore.setItemAsync('auth_token', access_token);
```

---

## 🛡️ **Step 3: Using JWT Tokens for Protected Routes**

### **🔍 Get User Profile (Protected Route)**

```bash
# Use the token to access protected routes
curl -X POST http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_token_here"
```

### **📋 Create a Listing (Protected Route)**

```bash
# User must be logged in to create listings
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "providerId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "ट्रैक्टर किराए पर (Tractor for Rent)",
    "description": "Well-maintained Mahindra tractor available for farming",
    "category": "Agricultural Equipment",
    "subCategory": "Tractors",
    "coordinates": [77.5946, 12.9716],
    "price": 500,
    "availableFrom": "2024-01-15T00:00:00.000Z",
    "availableTo": "2024-12-31T23:59:59.000Z"
  }'
```

---

## 🧪 **Step 4: Complete Authentication Testing**

### **🔄 Full Authentication Flow Test**

```bash
#!/bin/bash
# Save this as test-auth.sh and run it

echo "🌾 Testing Rural Share Authentication..."
echo "======================================"

# 1. Register a new user
echo "📝 1. Registering new user..."
register_response=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@farmer.com",
    "password": "TestPass123!",
    "role": "individual"
  }')

echo "✅ User registered: $register_response"

# 2. Login the user
echo "🔑 2. Logging in user..."
login_response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farmer.com",
    "password": "TestPass123!"
  }')

# Extract token (you might need jq for this)
token=$(echo $login_response | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')
echo "✅ Login successful! Token: ${token:0:50}..."

# 3. Access protected route
echo "🛡️ 3. Accessing protected profile..."
profile_response=$(curl -s -X POST http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token")

echo "✅ Profile accessed: $profile_response"

echo "🎉 Authentication test completed successfully!"
```

---

## 🚨 **Step 5: Handling Authentication Errors**

### **Common Error Scenarios and Solutions**

#### **❌ Invalid Credentials**
```bash
# Wrong password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ram.kumar@example.com",
    "password": "WrongPassword"
  }'
```

**Error Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

#### **❌ User Already Exists**
```bash
# Try to register with existing email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "ram.kumar@example.com",
    "password": "AnotherPass123!",
    "role": "individual"
  }'
```

#### **❌ Invalid JWT Token**
```bash
# Access protected route with invalid token
curl -X POST http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Error Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 🔐 **Step 6: Frontend Integration Examples**

### **📱 React/JavaScript Example**

```javascript
// AuthService.js - Complete authentication service
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/auth';
    this.token = localStorage.getItem('auth_token');
  }

  // 📝 Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const user = await response.json();
        console.log('✅ User registered successfully:', user);
        return { success: true, user };
      } else {
        const error = await response.json();
        console.error('❌ Registration failed:', error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('🔥 Network error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // 🔑 Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { access_token } = await response.json();
        
        // Store token securely
        localStorage.setItem('auth_token', access_token);
        this.token = access_token;
        
        console.log('✅ Login successful!');
        return { success: true, token: access_token };
      } else {
        const error = await response.json();
        console.error('❌ Login failed:', error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('🔥 Network error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // 🛡️ Get user profile
  async getProfile() {
    if (!this.token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const profile = await response.json();
        return { success: true, profile };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  // 🚪 Logout user
  logout() {
    localStorage.removeItem('auth_token');
    this.token = null;
    console.log('👋 User logged out');
  }

  // 🔍 Check if user is logged in
  isLoggedIn() {
    return !!this.token;
  }

  // 🎫 Get current token
  getToken() {
    return this.token;
  }
}

// Usage example
const authService = new AuthService();

// Register a new farmer
const registrationResult = await authService.register({
  name: 'राम कुमार',
  email: 'ram@example.com',
  password: 'FarmLife123!',
  role: 'individual'
});

if (registrationResult.success) {
  console.log('🎉 Registration successful!', registrationResult.user);
  
  // Now login
  const loginResult = await authService.login('ram@example.com', 'FarmLife123!');
  
  if (loginResult.success) {
    console.log('🔑 Login successful!');
    
    // Get user profile
    const profileResult = await authService.getProfile();
    if (profileResult.success) {
      console.log('👤 User profile:', profileResult.profile);
    }
  }
}
```

---

## 🎯 **Step 7: Best Practices & Security Tips**

### **🔒 Password Security**
```javascript
// Good password requirements
const passwordRequirements = {
  minLength: 8,
  mustHave: [
    'At least one uppercase letter',
    'At least one lowercase letter', 
    'At least one number',
    'At least one special character'
  ],
  examples: [
    'FarmLife123!',
    'Rural@Share2024',
    'Krishi#Seva999'
  ]
};

// Validate password function
function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  return Object.values(checks).every(check => check);
}
```

### **🛡️ Token Management**
```javascript
// Good token management practices
class TokenManager {
  static storeToken(token) {
    // Set expiration time (24 hours from now)
    const expirationTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_expiration', expirationTime.toString());
  }
  
  static getToken() {
    const token = localStorage.getItem('auth_token');
    const expiration = localStorage.getItem('token_expiration');
    
    if (!token || !expiration) return null;
    
    // Check if token is expired
    if (new Date().getTime() > parseInt(expiration)) {
      this.clearToken();
      return null;
    }
    
    return token;
  }
  
  static clearToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiration');
  }
  
  static isTokenValid() {
    return !!this.getToken();
  }
}
```

### **🔄 Auto-Refresh Token Strategy**
```javascript
// Automatically refresh token before expiration
class AuthManager {
  constructor() {
    this.setupTokenRefresh();
  }
  
  setupTokenRefresh() {
    // Check token validity every 5 minutes
    setInterval(() => {
      const expiration = localStorage.getItem('token_expiration');
      if (expiration) {
        const timeUntilExpiry = parseInt(expiration) - new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;
        
        // Refresh if token expires in less than 1 hour
        if (timeUntilExpiry < oneHourInMs) {
          this.refreshToken();
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
  
  async refreshToken() {
    // In a real app, you'd have a refresh token endpoint
    console.log('🔄 Token refresh needed - redirect to login');
    // Redirect to login or show refresh dialog
  }
}
```

---

## 📊 **Step 8: Monitoring Authentication**

### **📈 Track Authentication Events**
```javascript
// Log authentication events for monitoring
class AuthLogger {
  static logEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      ip: 'client-side' // Server would log actual IP
    };
    
    console.log('📊 Auth Event:', logEntry);
    
    // In production, send to logging service
    // this.sendToLoggingService(logEntry);
  }
  
  static logLogin(email, success) {
    this.logEvent('LOGIN_ATTEMPT', { email, success });
  }
  
  static logLogout(email) {
    this.logEvent('LOGOUT', { email });
  }
  
  static logRegistration(email, role) {
    this.logEvent('REGISTRATION', { email, role });
  }
}

// Use in your auth service
const result = await authService.login(email, password);
AuthLogger.logLogin(email, result.success);
```

---

## 🎉 **You're All Set!**

Now you have a complete authentication system that handles:
- ✅ **User Registration** for all user types
- ✅ **Secure Login** with JWT tokens  
- ✅ **Protected Routes** access
- ✅ **Error Handling** for common scenarios
- ✅ **Frontend Integration** examples
- ✅ **Security Best Practices**
- ✅ **Token Management** strategies

Your rural sharing platform is now ready to authenticate farmers, SHGs, FPOs, and admins securely! 🌾🔐 