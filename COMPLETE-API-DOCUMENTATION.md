# 🌾 Rural Share Server - Complete API Documentation

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication & Authorization](#authentication--authorization)
3. [User Management](#user-management)
4. [Listings & Catalogue](#listings--catalogue)
5. [Orders & Escrow](#orders--escrow)
6. [Chat & Messages](#chat--messages)
7. [Ratings & Reviews](#ratings--reviews)
8. [Disputes & Support](#disputes--support)
9. [KYC & Addresses](#kyc--addresses)
10. [Data Structures & Schemas](#data-structures--schemas)
11. [Error Handling](#error-handling)
12. [WebSocket Events](#websocket-events)
13. [Testing Examples](#testing-examples)

---

## 🚀 Getting Started

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful"
}
```

---

## 🔐 Authentication & Authorization

### 1. Register User
Create a new user account (farmer, SHG, FPO, or admin).

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "राम कुमार (Ram Kumar)",
  "email": "ram.kumar@example.com", 
  "phone": "9876543210",
  "password": "FarmLife123!",
  "role": "individual"
}
```

**Request Body:**
- `name` (string, required): User's full name
- `email` (string, required): Valid email address
- `phone` (string, required): 10-15 digit phone number
- `password` (string, required): Minimum 6 characters
- `role` (string, required): One of `["individual", "SHG", "FPO", "admin"]`

**Response:**
```json
{
  "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "राम कुमार (Ram Kumar)",
  "email": "ram.kumar@example.com",
  "phone": "9876543210",
  "role": "individual",
  "isVerified": false,
  "kycStatus": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Login User
Authenticate with email and password.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ram.kumar@example.com",
  "password": "FarmLife123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. OTP Login
Login using phone number (automatically sets isVerified to true).

```http
POST /api/auth/otp-login
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "name": "राम कुमार (Ram Kumar)",
    "email": "ram.kumar@example.com",
    "phone": "9876543210",
    "role": "individual",
    "isVerified": true,
    "kycStatus": "pending"
  }
}
```

### 4. Get User Profile
Get current user's profile information.

```http
POST /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "email": "ram.kumar@example.com",
  "name": "राम कुमार (Ram Kumar)",
  "role": "individual"
}
```

---

## 👥 User Management

### 1. Get User Details
Retrieve specific user information.

```http
GET /api/users/{userId}
```

**Response:**
```json
{
  "id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "राम कुमार (Ram Kumar)",
  "email": "ram.kumar@example.com",
  "phone": "9876543210",
  "role": "individual",
  "isVerified": true,
  "kycStatus": "approved"
}
```

### 2. Update User
Update user information.

```http
PATCH /api/users/{userId}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543299",
  "isVerified": true,
  "kycStatus": "approved"
}
```

### 3. Verify User
Set user verification status to true.

```http
PATCH /api/users/{userId}/verify
```

### 4. Unverify User
Set user verification status to false.

```http
PATCH /api/users/{userId}/unverify
```

### 5. Check Phone Number
Check if a phone number is registered.

```http
GET /api/users/check-phone/{phoneNumber}
```

**Response:**
```json
{
  "phone": "9876543210",
  "exists": true,
  "message": "Phone number is registered"
}
```

---

## 📋 Listings & Catalogue

### 1. Create Listing
Create a new equipment/service listing.

```http
POST /api/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "providerId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "title": "John Deere Tractor for Rent",
  "description": "Well-maintained tractor available for farming",
  "categoryId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "subCategoryId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "photos": ["https://example.com/tractor1.jpg"],
  "videoUrl": "https://example.com/video.mp4",
  "coordinates": [77.5946, 12.9716],
  "price": 500,
  "unitOfMeasure": "per_day",
  "minimumOrder": 1,
  "availableFrom": "2024-01-01T00:00:00.000Z",
  "availableTo": "2024-12-31T23:59:59.000Z",
  "tags": ["tractor", "farming", "agricultural"],
  "termsAndConditions": "Equipment must be returned in good condition"
}
```

### 2. Get All Listings
Retrieve all active listings.

```http
GET /api/listings
```

### 3. Get Listings by Provider
Get all listings from a specific provider.

```http
GET /api/listings/provider/{providerId}
```

### 4. Get Listing Details
Get detailed information about a specific listing.

```http
GET /api/listings/{listingId}
```

### 5. Update Listing
Update listing information.

```http
PATCH /api/listings/{listingId}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 550,
  "isActive": true
}
```

### 6. Delete Listing
Remove a listing.

```http
DELETE /api/listings/{listingId}
```

### 7. Get Catalogue Categories
Retrieve all categories and subcategories.

```http
GET /api/catalogue/categories
```

### 8. Get Category Hierarchy
Get complete category hierarchy.

```http
GET /api/catalogue/hierarchy
```

---

## 🛒 Orders & Escrow

### 1. Create Order
Place a new order for equipment/service.

```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "seekerId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "providerId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "orderType": "rental",
  "totalAmount": 500,
  "serviceStartDate": "2024-01-15T00:00:00.000Z",
  "serviceEndDate": "2024-01-16T00:00:00.000Z",
  "quantity": 1,
  "unitOfMeasure": "per_day",
  "coordinates": [77.5946, 12.9716]
}
```

### 2. Get All Orders
Retrieve all orders.

```http
GET /api/orders
```

### 3. Get Orders by Seeker
Get orders placed by a specific seeker.

```http
GET /api/orders/seeker/{seekerId}
```

### 4. Get Orders by Provider
Get orders received by a specific provider.

```http
GET /api/orders/provider/{providerId}
```

### 5. Get Provider Summary
Get order summary for a provider.

```http
GET /api/orders/provider/{providerId}/summary
```

### 6. Update Order Status
Change the status of an order.

```http
PATCH /api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "accepted",
  "updatedBy": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

### 7. Create Escrow
Create an escrow for secure payment.

```http
POST /api/escrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "seekerId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "providerId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "amount": 500,
  "transactionId": "TXN123456789"
}
```

### 8. Release Escrow
Release escrow payment to provider.

```http
PATCH /api/escrow/{orderId}/release
Authorization: Bearer <token>
```

### 9. Refund Escrow
Refund escrow payment to seeker.

```http
PATCH /api/escrow/{orderId}/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Service not delivered as expected"
}
```

### 10. Get Escrow Summary
Get escrow summary for a user.

```http
GET /api/escrow/summary
Authorization: Bearer <token>
```

---

## 💬 Chat & Messages

### 1. Create Conversation
Start a new conversation between two users.

```http
POST /api/chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "relatedOrderId": "65f1a2b3c4d5e6f7g8h9i0j2"
}
```

### 2. Get Conversations
Retrieve all conversations for the current user.

```http
GET /api/chat/conversations?page=1&limit=10
Authorization: Bearer <token>
```

### 3. Get Conversation Details
Get details of a specific conversation.

```http
GET /api/chat/conversations/{conversationId}
Authorization: Bearer <token>
```

### 4. Send Message
Send a message in a conversation.

```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "type": "text",
  "content": "Hello, is the tractor still available?",
  "metadata": {
    "imageUrl": "https://example.com/image.jpg"
  }
}
```

### 5. Get Messages
Get messages from a conversation.

```http
GET /api/chat/conversations/{conversationId}/messages?page=1&limit=20
Authorization: Bearer <token>
```

### 6. Mark Messages as Read
Mark messages as read.

```http
POST /api/chat/mark-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "messageIds": ["msg1", "msg2"]
}
```

### 7. Get Unread Count
Get count of unread messages.

```http
GET /api/chat/unread-count
Authorization: Bearer <token>
```

---

## ⭐ Ratings & Reviews

### 1. Create Rating
Rate a completed order.

```http
POST /api/ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "raterId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "ratedId": "65f1a2b3c4d5e6f7g8h9i0j3",
  "score": 5,
  "review": "Excellent service! Equipment was in perfect condition."
}
```

### 2. Get Ratings by Order
Get ratings for a specific order.

```http
GET /api/ratings/order/{orderId}
```

### 3. Get Ratings by User
Get all ratings for a specific user.

```http
GET /api/ratings/user/{userId}
```

---

## 🚨 Disputes & Support

### 1. Create Dispute
Raise a dispute for an order.

```http
POST /api/disputes
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "againstUserId": "65f1a2b3c4d5e6f7g8h9i0j2",
  "reason": "Equipment not delivered on time",
  "description": "The tractor was supposed to be delivered on 15th Jan but never arrived.",
  "evidenceUrls": ["https://example.com/evidence1.jpg"]
}
```

### 2. Get Disputes
Get all disputes for the current user.

```http
GET /api/disputes?status=open
Authorization: Bearer <token>
```

### 3. Get Dispute Details
Get details of a specific dispute.

```http
GET /api/disputes/{disputeId}
Authorization: Bearer <token>
```

### 4. Add Message to Dispute
Add a message to an existing dispute.

```http
POST /api/disputes/{disputeId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I have additional evidence to support my claim",
  "attachments": ["https://example.com/evidence2.jpg"]
}
```

### 5. Update Dispute Status
Update the status of a dispute (Admin only).

```http
PATCH /api/disputes/{disputeId}/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "resolved"
}
```

### 6. Resolve Dispute
Resolve a dispute with a specific resolution (Admin only).

```http
POST /api/disputes/{disputeId}/resolve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "resolution": "refund_to_seeker",
  "amount": 250,
  "reason": "Provider failed to deliver service as promised"
}
```

---

## 📄 KYC & Addresses

### 1. Upload KYC Document
Upload a KYC document for verification.

```http
POST /api/kyc/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "docType": "aadhar",
  "docURL": "https://example.com/aadhar.pdf",
  "docNumber": "1234 5678 9012"
}
```

### 2. Get User KYC Documents
Get all KYC documents for a user.

```http
GET /api/kyc/documents/user/{userId}
```

### 3. Update KYC Status
Update the status of a KYC document (Admin only).

```http
PATCH /api/kyc/documents/{documentId}/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "approved",
  "verifiedBy": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

### 4. Create Address
Add a new address for a user.

```http
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "tag": "home",
  "addressLine1": "123 Main Street",
  "addressLine2": "Near Post Office",
  "village": "Rampur",
  "tehsil": "Rampur",
  "district": "Rampur",
  "state": "Uttar Pradesh",
  "pincode": "244901",
  "coordinates": [77.5946, 12.9716],
  "isDefault": true
}
```

### 5. Get User Addresses
Get all addresses for a user.

```http
GET /api/addresses/user/{userId}
Authorization: Bearer <token>
```

### 6. Update Address
Update an existing address.

```http
PATCH /api/addresses/{addressId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "tag": "work",
  "isDefault": false
}
```

### 7. Set Default Address
Set an address as default.

```http
PATCH /api/addresses/{addressId}/set-default
Authorization: Bearer <token>
```

### 8. Delete Address
Remove an address.

```http
DELETE /api/addresses/{addressId}
Authorization: Bearer <token>
```

---

## 📊 Data Structures & Schemas

### User Schema
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  password: string, // Hashed
  role: "individual" | "SHG" | "FPO" | "admin",
  isVerified: boolean,
  kycStatus: "none" | "pending" | "approved" | "rejected",
  preferences: {
    defaultLandingPage: "provider" | "seeker",
    defaultProviderTab: "active" | "completed" | "review",
    preferredLanguage: string,
    notificationsEnabled: boolean
  },
  defaultAddressId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Listing Schema
```typescript
{
  _id: ObjectId,
  providerId: ObjectId,
  title: string,
  description: string,
  categoryId: ObjectId,
  subCategoryId: ObjectId,
  photos: string[],
  videoUrl?: string,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  price: number,
  unitOfMeasure: "per_hour" | "per_day" | "per_piece" | "per_kg" | "per_unit",
  minimumOrder?: number,
  availableFrom: Date,
  availableTo: Date,
  isActive: boolean,
  viewCount: number,
  bookingCount: number,
  tags: string[],
  termsAndConditions?: string,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  _id: ObjectId,
  listingId: ObjectId,
  seekerId: ObjectId,
  providerId: ObjectId,
  status: "pending" | "accepted" | "paid" | "completed" | "canceled",
  orderType: "rental" | "hiring" | "purchase",
  createdAt: Date,
  requestExpiresAt: Date,
  serviceStartDate?: Date,
  serviceEndDate?: Date,
  quantity?: number,
  unitOfMeasure?: string,
  totalAmount: number,
  coordinates?: [longitude, latitude],
  isAutoRejected: boolean,
  acceptedAt?: Date,
  paidAt?: Date,
  completedAt?: Date,
  canceledAt?: Date,
  cancellationReason?: string,
  updatedAt: Date
}
```

### Escrow Schema
```typescript
{
  _id: ObjectId,
  orderId: ObjectId,
  seekerId: ObjectId,
  providerId: ObjectId,
  amount: number,
  status: "held" | "released" | "refunded" | "disputed" | "partial_refund",
  heldAt: Date,
  releasedAt?: Date,
  refundedAt?: Date,
  transactionId?: string,
  disputeReason?: string,
  releasedBy?: ObjectId,
  refundedBy?: ObjectId,
  refundAmount?: number,
  metadata?: Record<string, any>,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Schema
```typescript
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId],
  lastMessage: ObjectId,
  lastActivity: Date,
  relatedOrderId?: ObjectId,
  lastReadBy: Map<string, Date>,
  unreadCount: Map<string, number>,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  type: "text" | "image" | "file" | "system",
  content: string,
  metadata?: Record<string, any>,
  isRead: boolean,
  readBy: ObjectId[],
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Schema
```typescript
{
  _id: ObjectId,
  orderId: ObjectId,
  raterId: ObjectId,
  ratedId: ObjectId,
  score: number, // 1-5
  review: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Dispute Schema
```typescript
{
  _id: ObjectId,
  orderId: ObjectId,
  raisedBy: ObjectId,
  againstUser: ObjectId,
  reason: string,
  description?: string,
  evidenceUrls: string[],
  status: "open" | "under_review" | "resolved" | "closed",
  resolution: "pending" | "refund_to_seeker" | "release_to_provider" | "partial_refund",
  resolvedBy?: ObjectId,
  resolvedAt?: Date,
  messages: [{
    userId: ObjectId,
    message: string,
    timestamp: Date,
    attachments?: string[]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Address Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  tag: "home" | "work" | "personal" | "other",
  addressLine1: string,
  addressLine2?: string,
  village: string,
  tehsil: string,
  district: string,
  state: string,
  pincode: string,
  coordinates: [longitude, latitude],
  isDefault: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### KYC Document Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  docType: "aadhar" | "pan" | "passport" | "voter_id" | "driving_license",
  docURL: string,
  docNumber?: string,
  status: "pending" | "approved" | "rejected",
  rejectionReason?: string,
  verifiedAt?: Date,
  verifiedBy?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "statusCode": 400
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": ["Email must be a valid email address"],
    "phone": ["Phone number must be 10-15 digits"],
    "password": ["Password must be at least 6 characters"]
  },
  "statusCode": 400
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events to Listen For
```javascript
// New message received
socket.on('message', (data) => {
  console.log('New message:', data);
});

// User typing indicator
socket.on('typing', (data) => {
  console.log('User typing:', data);
});

// User stopped typing
socket.on('stopTyping', (data) => {
  console.log('User stopped typing:', data);
});

// Message read receipt
socket.on('messageRead', (data) => {
  console.log('Message read:', data);
});
```

### Events to Emit
```javascript
// Join a conversation
socket.emit('joinConversation', {
  conversationId: '65f1a2b3c4d5e6f7g8h9i0j1'
});

// Send typing indicator
socket.emit('typing', {
  conversationId: '65f1a2b3c4d5e6f7g8h9i0j1'
});

// Stop typing indicator
socket.emit('stopTyping', {
  conversationId: '65f1a2b3c4d5e6f7g8h9i0j1'
});

// Mark message as read
socket.emit('markAsRead', {
  conversationId: '65f1a2b3c4d5e6f7g8h9i0j1',
  messageId: '65f1a2b3c4d5e6f7g8h9i0j2'
});
```

---

## 🧪 Testing Examples

### Complete User Registration & Login Flow
```javascript
async function testUserFlow() {
  const baseURL = 'http://localhost:3000/api';
  
  // 1. Register a new user
  const registerResponse = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Farmer',
      email: 'test@example.com',
      phone: '9876543210',
      password: 'TestPass123!',
      role: 'individual'
    })
  });
  
  const user = await registerResponse.json();
  console.log('User registered:', user);
  
  // 2. Login the user
  const loginResponse = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'TestPass123!'
    })
  });
  
  const { access_token } = await loginResponse.json();
  console.log('Login successful, token:', access_token);
  
  // 3. Get user profile
  const profileResponse = await fetch(`${baseURL}/auth/profile`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  const profile = await profileResponse.json();
  console.log('User profile:', profile);
}
```

### Create Listing Flow
```javascript
async function testListingFlow(token) {
  const baseURL = 'http://localhost:3000/api';
  
  // Create a new listing
  const listingResponse = await fetch(`${baseURL}/listings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      providerId: '65f1a2b3c4d5e6f7g8h9i0j1',
      title: 'Tractor for Rent',
      description: 'John Deere tractor available',
      categoryId: '65f1a2b3c4d5e6f7g8h9i0j2',
      subCategoryId: '65f1a2b3c4d5e6f7g8h9i0j3',
      photos: ['https://example.com/tractor.jpg'],
      coordinates: [77.5946, 12.9716],
      price: 500,
      unitOfMeasure: 'per_day',
      availableFrom: '2024-01-01T00:00:00.000Z',
      availableTo: '2024-12-31T23:59:59.000Z'
    })
  });
  
  const listing = await listingResponse.json();
  console.log('Listing created:', listing);
}
```

### Order Flow
```javascript
async function testOrderFlow(token) {
  const baseURL = 'http://localhost:3000/api';
  
  // 1. Create an order
  const orderResponse = await fetch(`${baseURL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listingId: '65f1a2b3c4d5e6f7g8h9i0j1',
      seekerId: '65f1a2b3c4d5e6f7g8h9i0j2',
      providerId: '65f1a2b3c4d5e6f7g8h9i0j3',
      orderType: 'rental',
      totalAmount: 500,
      serviceStartDate: '2024-01-15T00:00:00.000Z',
      serviceEndDate: '2024-01-16T00:00:00.000Z'
    })
  });
  
  const order = await orderResponse.json();
  console.log('Order created:', order);
  
  // 2. Create escrow
  const escrowResponse = await fetch(`${baseURL}/escrow`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId: order._id,
      seekerId: '65f1a2b3c4d5e6f7g8h9i0j2',
      providerId: '65f1a2b3c4d5e6f7g8h9i0j3',
      amount: 500,
      transactionId: 'TXN123456789'
    })
  });
  
  const escrow = await escrowResponse.json();
  console.log('Escrow created:', escrow);
}
```

---

## 🎯 Quick Start Checklist

### For Frontend Development:
1. ✅ Set up authentication (login/register)
2. ✅ Implement JWT token management
3. ✅ Create user profile management
4. ✅ Build listing creation and browsing
5. ✅ Implement order management
6. ✅ Add chat functionality with WebSocket
7. ✅ Create rating and review system
8. ✅ Add dispute resolution flow
9. ✅ Implement KYC document upload
10. ✅ Add address management

### Common Use Cases:
- **Farmer registers** → Creates listing → Receives orders → Accepts orders → Gets paid
- **Seeker searches** → Finds listing → Places order → Pays via escrow → Rates experience
- **Chat system** → Real-time messaging → Order-related discussions → Support
- **Dispute resolution** → Raise dispute → Admin review → Resolution with refund/release

---

## 📚 Additional Resources

### Environment Variables
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rural-share
JWT_SECRET=your-jwt-secret-key
```

### Development Commands
```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing Commands
```bash
# Test authentication
./test-auth-live.sh

# Test with PowerShell
./test-auth-live.ps1
```

---

## 🤝 Support

If you encounter any issues or need clarification on any endpoint, please refer to the test files in the project or contact the backend development team.

**Key Files for Reference:**
- `test-api-calls.md` - Complete API testing examples
- `authentication-guide.md` - Detailed authentication guide
- `otp-login-test-guide.md` - OTP login implementation
- `phone-check-endpoint-guide.md` - Phone validation endpoints

---

*This documentation covers the complete Rural Share Server API as of the current version. All endpoints have been tested and verified to work correctly.* 