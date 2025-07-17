# 🔍 Debug OTP Login Issue - Step by Step Guide

## 🚨 **Issue:** Phone numbers show as "not registered" even when they exist

---

## 🧪 **Step 1: Check What's in the Database**

First, let's see what phone numbers are actually stored:

```bash
# Check all users with phone numbers
curl -X GET http://localhost:3000/api/users/debug/phones
```

This will show you:
- All users in the database
- Their phone numbers
- The exact format they're stored in

---

## 🧪 **Step 2: Test Registration with Phone Number**

Let's register a new user and see what happens:

```bash
# Register a new user with phone number
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug Test User",
    "email": "debug@test.com",
    "phone": "8331098232",
    "password": "TestPass123!",
    "role": "individual"
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "name": "Debug Test User",
  "email": "debug@test.com",
  "phone": "8331098232",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending"
}
```

---

## 🧪 **Step 3: Verify Phone Number is Stored**

Check if the phone number was stored correctly:

```bash
# Check users again to see if new user appears
curl -X GET http://localhost:3000/api/users/debug/phones
```

Look for the user you just created and verify:
- Phone number is exactly "8331098232"
- No extra spaces or characters
- User appears in the list

---

## 🧪 **Step 4: Test OTP Login with Debug Logs**

Now try the OTP login and watch the server logs:

```bash
# Test OTP login
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8331098232"
  }'
```

**Check Server Logs for:**
```
Searching for phone: 8331098232
Found user: debug@test.com (or null)
```

---

## 🧪 **Step 5: Common Issues and Solutions**

### **Issue 1: Phone Number Format Mismatch**

**Problem:** Phone stored as "8331098232" but searching for "+918331098232"
**Solution:** Ensure consistent format

### **Issue 2: Phone Field Not Indexed**

**Problem:** Phone field exists but not searchable
**Solution:** Check MongoDB index

```bash
# In MongoDB shell
db.users.getIndexes()
```

### **Issue 3: Existing Users Without Phone Numbers**

**Problem:** Old users don't have phone numbers
**Solution:** Update existing users or handle null phones

### **Issue 4: Database Connection Issues**

**Problem:** Database queries failing silently
**Solution:** Check MongoDB connection

---

## 🔧 **Step 6: Manual Database Check**

If you have access to MongoDB directly:

```javascript
// Connect to MongoDB
use rural-share-dev // or your database name

// Check all users
db.users.find({}, {name: 1, email: 1, phone: 1})

// Check specific phone number
db.users.find({phone: "8331098232"})

// Check if phone field exists
db.users.find({phone: {$exists: true}})

// Check phone field type
db.users.find({phone: {$type: "string"}})
```

---

## 🛠️ **Step 7: Fix Common Issues**

### **Fix 1: Add Phone Index (if missing)**

```javascript
// In MongoDB
db.users.createIndex({phone: 1}, {unique: true})
```

### **Fix 2: Update Existing Users (if needed)**

```javascript
// Add default phone numbers to users without them
db.users.updateMany(
  {phone: {$exists: false}}, 
  {$set: {phone: "0000000000"}}
)
```

### **Fix 3: Clean Phone Number Format**

```javascript
// Remove any non-numeric characters
db.users.updateMany(
  {}, 
  [{$set: {phone: {$replaceAll: {input: "$phone", find: /[^0-9]/g, replacement: ""}}}}]
)
```

---

## 🧪 **Step 8: Test Different Phone Number Formats**

Try these variations to see which works:

```bash
# Test with different formats
curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "8331098232"}'

curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+918331098232"}'

curl -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{"phone": "08331098232"}'
```

---

## 🎯 **Step 9: Complete Working Example**

Here's a complete test that should work:

```bash
#!/bin/bash

echo "🔍 Debugging OTP Login Issue..."

# 1. Check existing users
echo "📋 1. Checking existing users with phones..."
curl -s -X GET http://localhost:3000/api/users/debug/phones | jq

# 2. Register new user
echo "📝 2. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug User",
    "email": "debug@example.com",
    "phone": "8331098232",
    "password": "TestPass123!",
    "role": "individual"
  }')

echo "Registration response: $REGISTER_RESPONSE"

# 3. Check if user was added
echo "📋 3. Checking users again..."
curl -s -X GET http://localhost:3000/api/users/debug/phones | jq

# 4. Test OTP login
echo "🔐 4. Testing OTP login..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/otp-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "8331098232"
  }')

echo "OTP login response: $OTP_RESPONSE"

echo "🎉 Debug completed!"
```

---

## 🔍 **Expected Results**

After following these steps, you should see:

1. **Users list shows phone numbers** - Debug endpoint returns users with phones
2. **Registration works** - New users get saved with phone numbers
3. **Phone lookup works** - OTP login finds the user
4. **Login succeeds** - Returns JWT token and user info

---

## 🚨 **If Still Not Working**

Check these additional issues:

1. **Database Connection** - Is MongoDB running?
2. **Schema Validation** - Are phone numbers being rejected?
3. **Middleware Issues** - Are requests being processed correctly?
4. **Case Sensitivity** - Are phone numbers case-sensitive?
5. **Special Characters** - Are there hidden characters in phone numbers?

---

## 📞 **Contact Information**

If the issue persists:
1. Share the output of the debug endpoint
2. Share the server logs
3. Share the MongoDB query results
4. Share any error messages

This will help identify the exact cause of the phone number lookup failure.

---

## 🎯 **Summary**

The most common causes are:
1. **Phone field not indexed** - Add unique index
2. **Format mismatch** - Ensure consistent phone format
3. **Existing users** - Old users without phone numbers
4. **Database issues** - Connection or query problems

Follow the debugging steps above to identify and fix the specific issue in your system! 