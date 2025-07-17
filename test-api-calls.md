# 🧪 Rural Share Server - API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## 1. 🔐 Authentication Flow

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "password": "SecurePass123",
    "role": "individual"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ramesh@example.com",
    "password": "SecurePass123"
  }'
```

**Response will include JWT token - save this for authenticated requests:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. 👥 User Management

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. 📋 Create Equipment Listing

### Create a Tractor Sharing Listing
```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": "USER_ID_HERE",
    "title": "John Deere Tractor for Rent",
    "description": "Well-maintained tractor available for farming operations",
    "category": "Agricultural Equipment",
    "subCategory": "Tractors",
    "photos": ["https://example.com/tractor1.jpg"],
    "coordinates": [77.5946, 12.9716],
    "price": 500,
    "availableFrom": "2024-01-01T00:00:00.000Z",
    "availableTo": "2024-12-31T23:59:59.000Z"
  }'
```

### Get All Listings
```bash
curl -X GET http://localhost:3000/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. 🛒 Order Management

### Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "listingId": "LISTING_ID_HERE",
    "seekerId": "SEEKER_USER_ID",
    "providerId": "PROVIDER_USER_ID",
    "status": "pending",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "totalAmount": 500,
    "coordinates": [77.5946, 12.9716]
  }'
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "accepted"
  }'
```

## 5. 🆔 KYC Document Upload

### Upload KYC Document
```bash
curl -X POST http://localhost:3000/api/kyc/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_ID_HERE",
    "docType": "Aadhar",
    "docURL": "https://example.com/aadhar.pdf",
    "status": "pending"
  }'
```

## 6. 💰 Escrow Management

### Create Escrow Entry
```bash
curl -X POST http://localhost:3000/api/escrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "amount": 500,
    "status": "held"
  }'
```

## 7. ⭐ Rating System

### Create Rating
```bash
curl -X POST http://localhost:3000/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "raterId": "RATER_USER_ID",
    "ratedId": "RATED_USER_ID",
    "rating": 5,
    "comment": "Excellent service! Tractor was in great condition."
  }'
```

## 8. 💼 Commission Tracking

### Create Commission Entry
```bash
curl -X POST http://localhost:3000/api/commissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_ID_HERE",
    "amount": 25,
    "type": "platform_fee"
  }'
```

## 🔄 Complete Testing Flow

1. **Register** → Get user ID
2. **Login** → Get JWT token
3. **Create Listing** → Get listing ID
4. **Place Order** → Get order ID
5. **Create Escrow** → Secure payment
6. **Update Order Status** → Accept/Complete
7. **Rate Transaction** → Build trust
8. **Track Commission** → Platform revenue

## 🚀 Quick Test Script

Save this as `test-flow.sh`:
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌾 Testing Rural Share Server${NC}"
echo "=================================="

# Test if server is running
curl -s http://localhost:3000/api/auth/login > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Server is running!${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with 'npm run start:dev'${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Register a test user...${NC}"
# Add your test calls here

echo -e "${GREEN}🎉 All tests completed!${NC}"
```

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
``` 