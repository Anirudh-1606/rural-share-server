# 🔐 OTP Login Endpoint - Test Guide

## 🎯 **New Endpoint Specifications**

### **Endpoint**
```
POST /api/auth/otp-login
```

### **Request Body**
```json
{
  "phone": "8331098232"
}
```

---

## 🧪 **Testing Steps**

### **Step 1: Register a User with Phone Number**

```bash
# Register a new user (now requires phone number)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samminga Sainath Rao",
    "email": "sai@gmail.com",
    "phone": "8331098232",
    "password": "TestPass123!",
    "role": "individual"
  }'
```

**Expected Response:**
```json
{
  "_id": "68765b07caa1f36523d82684",
  "name": "Samminga Sainath Rao",
  "email": "sai@gmail.com",
  "phone": "8331098232",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending",
  "createdAt": "2025-07-15T13:43:35.140Z",
  "updatedAt": "2025-07-15T13:43:35.140Z"
}
```

### **Step 2: Test OTP Login**

```bash
# Login using phone number (OTP login)
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8331098232"
  }'
```

**Expected Response (200 Success):**
```json
{
  "message": "OTP login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68765b07caa1f36523d82684",
    "name": "Samminga Sainath Rao",
    "email": "sai@gmail.com",
    "phone": "8331098232",
    "role": "individual",
    "isVerified": true,
    "kycStatus": "pending",
    "createdAt": "2025-07-15T13:43:35.140Z",
    "updatedAt": "2025-07-15T13:43:35.140Z"
  }
}
```

**Notice:** `isVerified` automatically changes to `true` after OTP login!

---

## 🚨 **Error Testing**

### **Test 1: Invalid Phone Number**

```bash
# Test with invalid phone number
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "123"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Valid phone number is required"
}
```

### **Test 2: Phone Number Not Registered**

```bash
# Test with unregistered phone number
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999"
  }'
```

**Expected Response (404 Not Found):**
```json
{
  "message": "Phone number not registered"
}
```

### **Test 3: Invalid Phone Format**

```bash
# Test with non-numeric phone number
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "abc123def"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Valid phone number is required"
}
```

---

## 🚀 **Frontend Integration**

### **JavaScript Example:**

```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/auth';
  }

  // 📱 OTP Login
  async otpLogin(phoneNumber) {
    try {
      const response = await fetch(`${this.baseURL}/otp-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token
        localStorage.setItem('auth_token', data.token);
        
        console.log('✅ OTP Login successful:', data);
        return { success: true, data };
      } else {
        const error = await response.json();
        console.error('❌ OTP Login failed:', error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('🔥 Network error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // 📝 Register with phone (updated)
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone, // Now required!
          password: userData.password,
          role: userData.role
        })
      });

      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }
}

// Usage Example:
const authService = new AuthService();

// Register user
const registerResult = await authService.register({
  name: 'Samminga Sainath Rao',
  email: 'sai@gmail.com',
  phone: '8331098232',
  password: 'TestPass123!',
  role: 'individual'
});

if (registerResult.success) {
  console.log('User registered successfully!');
  
  // Login with OTP
  const loginResult = await authService.otpLogin('8331098232');
  
  if (loginResult.success) {
    console.log('🎉 OTP Login successful!');
    console.log('User:', loginResult.data.user);
    console.log('Token:', loginResult.data.token);
  }
}
```

### **React Component Example:**

```jsx
import React, { useState } from 'react';

const OTPLoginForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/otp-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        console.log('Login successful:', data);
        // Redirect to dashboard
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleOTPLogin}>
      <div>
        <label>Phone Number:</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter 10-15 digit phone number"
          pattern="[0-9]{10,15}"
          required
        />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login with OTP'}
      </button>
    </form>
  );
};

export default OTPLoginForm;
```

---

## 📋 **Complete Test Workflow**

```bash
#!/bin/bash
# Complete OTP Login Test Workflow

echo "🧪 Testing OTP Login Endpoint..."

# 1. Register user with phone
echo "📝 1. Registering user with phone..."
register_response=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "8331098232",
    "password": "TestPass123!",
    "role": "individual"
  }')

echo "✅ Registration: $register_response"

# 2. Test OTP Login
echo "🔐 2. Testing OTP Login..."
otp_response=$(curl -s -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8331098232"
  }')

echo "✅ OTP Login: $otp_response"

# 3. Test invalid phone
echo "❌ 3. Testing invalid phone..."
invalid_response=$(curl -s -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "123"
  }')

echo "❌ Invalid phone: $invalid_response"

# 4. Test unregistered phone
echo "❌ 4. Testing unregistered phone..."
unregistered_response=$(curl -s -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999"
  }')

echo "❌ Unregistered phone: $unregistered_response"

echo "🎉 OTP Login testing completed!"
```

---

## 🔑 **Key Features**

✅ **Phone Validation** - Only 10-15 digit numbers accepted  
✅ **Auto-Verification** - Sets `isVerified` to `true` automatically  
✅ **JWT Token** - 7-day expiration as specified  
✅ **Complete User Data** - Returns full user object  
✅ **Error Handling** - Proper 400/404/500 responses  
✅ **Unique Phone Index** - Prevents duplicate phone numbers  

---

## 📊 **API Summary**

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/auth/register` | POST | Register (now requires phone) |
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/otp-login` | POST | **Phone number login** |
| `/api/auth/profile` | POST | Get user profile |

---

## 🎉 **Implementation Complete!**

The OTP Login endpoint is now **live and ready** for your frontend engineer to use! All specifications have been implemented exactly as requested:

- ✅ **Validation** - Phone number format validation
- ✅ **Database** - Unique phone index added
- ✅ **Logic** - Auto-verification and JWT generation
- ✅ **Responses** - Exact format as specified
- ✅ **Error Handling** - All error cases covered

Your frontend engineer should be happy! 🚀📱 