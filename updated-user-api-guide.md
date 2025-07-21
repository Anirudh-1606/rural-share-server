# 🔄 Updated Rural Share User API Guide

## 🎯 **New Features Added**
- ✅ **Phone Number Field** - All users now have phone numbers
- ✅ **User Verification API** - Easy way to verify/unverify users
- ✅ **User Update API** - Update any user field
- ✅ **Enhanced User Profile** - Returns more user information

---

## 📝 **1. Updated User Registration (Now with Phone Number)**

### **🌾 Register a Farmer with Phone Number**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "राम कुमार (Ram Kumar)",
    "email": "ram.kumar@example.com",
    "phone": "+91-9876543210",
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
  "phone": "+91-9876543210",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### **👥 Register Other User Types**

```bash
# SHG Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "महिला सहायता समूह (Women Support Group)",
    "email": "women.shg@village.com",
    "phone": "+91-9876543211",
    "password": "Together2024!",
    "role": "SHG"
  }'

# FPO Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "पंजाब कृषक उत्पादक संगठन (Punjab FPO)",
    "email": "admin@punjabfpo.org",
    "phone": "+91-9876543212",
    "password": "FPOStrong2024!",
    "role": "FPO"
  }'
```

---

## 🔍 **2. Get User Profile (Now with Phone Number)**

```bash
curl -X GET http://localhost:3000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "राम कुमार (Ram Kumar)",
  "email": "ram.kumar@example.com",
  "phone": "+91-9876543210",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending"
}
```

---

## ✅ **3. Update isVerified Field to True**

### **Method 1: Quick Verify (Recommended)**

```bash
# ✅ Verify user - Sets isVerified to true
curl -X PATCH http://localhost:3000/api/users/USER_ID_HERE/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "User verified successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "राम कुमार (Ram Kumar)",
    "email": "ram.kumar@example.com",
    "phone": "+91-9876543210",
    "isVerified": true
  }
}
```

### **Method 2: Generic Update (For any field)**

```bash
# 🔄 Update any user field including isVerified
curl -X PATCH http://localhost:3000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "isVerified": true
  }'
```

### **Method 3: Update Multiple Fields at Once**

```bash
# 🔄 Update multiple fields including isVerified
curl -X PATCH http://localhost:3000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "isVerified": true,
    "kycStatus": "approved",
    "phone": "+91-9876543299"
  }'
```

---

## ❌ **4. Update isVerified Field to False**

```bash
# ❌ Unverify user - Sets isVerified to false
curl -X PATCH http://localhost:3000/api/users/USER_ID_HERE/unverify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "User unverified successfully",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "राम कुमार (Ram Kumar)",
    "email": "ram.kumar@example.com",
    "phone": "+91-9876543210",
    "isVerified": false
  }
}
```

---

## 📊 **5. Complete User Management Workflow**

### **Step-by-Step Example:**

```bash
# Step 1: Register user with phone number
echo "📝 Step 1: Registering user with phone number..."
register_response=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "test@farmer.com",
    "phone": "+91-9876543210",
    "password": "FarmLife123!",
    "role": "individual"
  }')

echo "✅ User registered: $register_response"

# Extract user ID
user_id=$(echo $register_response | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "📋 User ID: $user_id"

# Step 2: Login to get JWT token
echo "🔑 Step 2: Logging in..."
login_response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@farmer.com",
    "password": "FarmLife123!"
  }')

token=$(echo $login_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "✅ JWT Token: ${token:0:50}..."

# Step 3: Check user profile (should show isVerified: false)
echo "👤 Step 3: Checking user profile..."
profile_response=$(curl -s -X GET http://localhost:3000/api/users/$user_id \
  -H "Authorization: Bearer $token")

echo "📋 Profile: $profile_response"

# Step 4: Verify user (set isVerified to true)
echo "✅ Step 4: Verifying user..."
verify_response=$(curl -s -X PATCH http://localhost:3000/api/users/$user_id/verify \
  -H "Authorization: Bearer $token")

echo "🎉 Verification: $verify_response"

# Step 5: Check profile again (should show isVerified: true)
echo "👤 Step 5: Checking updated profile..."
updated_profile=$(curl -s -X GET http://localhost:3000/api/users/$user_id \
  -H "Authorization: Bearer $token")

echo "📋 Updated Profile: $updated_profile"
```

---

## 🚀 **6. Frontend Integration Examples**

### **JavaScript/React Example:**

```javascript
class UserService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = localStorage.getItem('auth_token');
  }

  // 📝 Register with phone number
  async registerWithPhone(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone, // Now required!
        password: userData.password,
        role: userData.role
      })
    });

    return response.json();
  }

  // 👤 Get user profile with phone
  async getUserProfile(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return response.json();
  }

  // ✅ Verify user (set isVerified to true)
  async verifyUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}/verify`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return response.json();
  }

  // ❌ Unverify user (set isVerified to false)
  async unverifyUser(userId) {
    const response = await fetch(`${this.baseURL}/users/${userId}/unverify`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });

    return response.json();
  }

  // 🔄 Update user fields
  async updateUser(userId, updates) {
    const response = await fetch(`${this.baseURL}/users/${userId}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}` 
      },
      body: JSON.stringify(updates)
    });

    return response.json();
  }
}

// Usage examples:
const userService = new UserService();

// Register with phone
const newUser = await userService.registerWithPhone({
  name: 'राम कुमार',
  email: 'ram@example.com',
  phone: '+91-9876543210',
  password: 'FarmLife123!',
  role: 'individual'
});

// Verify user
const verifyResult = await userService.verifyUser(newUser._id);
console.log('User verified:', verifyResult);

// Update multiple fields
const updateResult = await userService.updateUser(newUser._id, {
  isVerified: true,
  kycStatus: 'approved',
  phone: '+91-9876543299'
});
```

---

## 🔄 **7. New API Endpoints Summary**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user (now requires phone) |
| `GET` | `/api/users/:id` | Get user profile (now includes phone) |
| `PATCH` | `/api/users/:id` | Update any user field |
| `PATCH` | `/api/users/:id/verify` | Set isVerified to true |
| `PATCH` | `/api/users/:id/unverify` | Set isVerified to false |

---

## 📋 **8. Available Fields for Updates**

You can update these fields using the `PATCH /api/users/:id` endpoint:

```json
{
  "name": "Updated Name",
  "phone": "+91-9876543299",
  "isVerified": true,
  "kycStatus": "approved"
}
```

**Available kycStatus values:**
- `"none"` - No KYC documents submitted
- `"pending"` - KYC documents under review
- `"approved"` - KYC documents approved
- `"rejected"` - KYC documents rejected

---

## 🎉 **You're All Set!**

Now you can:
- ✅ Register users with **phone numbers**
- ✅ **Verify users** with a simple API call
- ✅ **Update any user field** easily
- ✅ **Manage user verification status**
- ✅ **Track KYC status** changes

Your Rural Share platform now has comprehensive user management! 🌾📱 