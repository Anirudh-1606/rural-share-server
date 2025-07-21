/**
 * 🌾 Rural Share Server - Frontend Testing Script
 * 
 * This script provides a complete testing suite for all API endpoints
 * Use this to verify API integration and understand request/response formats
 */

class RuralShareAPITester {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.token = null;
    this.userId = null;
    this.testData = {};
  }

  /**
   * 🔐 Authentication Tests
   */
  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    // 1. Register a new user
    try {
      const registerResponse = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Farmer',
          email: `test${Date.now()}@example.com`,
          phone: `98765${Math.floor(Math.random() * 100000)}`,
          password: 'TestPass123!',
          role: 'individual'
        })
      });
      
      const userData = await registerResponse.json();
      this.userId = userData._id;
      this.testData.user = userData;
      console.log('✅ User Registration:', userData);
      
      // 2. Login the user
      const loginResponse = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: 'TestPass123!'
        })
      });
      
      const loginData = await loginResponse.json();
      this.token = loginData.access_token;
      console.log('✅ User Login:', { token: this.token });
      
      // 3. Get user profile
      const profileResponse = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('✅ User Profile:', profileData);
      
      // 4. Test OTP login (if phone exists)
      const otpResponse = await fetch(`${this.baseURL}/auth/otp-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userData.phone
        })
      });
      
      const otpData = await otpResponse.json();
      console.log('✅ OTP Login:', otpData);
      
    } catch (error) {
      console.error('❌ Authentication Error:', error);
    }
  }

  /**
   * 👥 User Management Tests
   */
  async testUserManagement() {
    console.log('\n👥 Testing User Management...');
    
    try {
      // 1. Get user details
      const userResponse = await fetch(`${this.baseURL}/users/${this.userId}`);
      const userData = await userResponse.json();
      console.log('✅ Get User Details:', userData);
      
      // 2. Update user
      const updateResponse = await fetch(`${this.baseURL}/users/${this.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Test Farmer',
          isVerified: true
        })
      });
      
      const updatedUser = await updateResponse.json();
      console.log('✅ Update User:', updatedUser);
      
      // 3. Check phone number
      const phoneCheckResponse = await fetch(`${this.baseURL}/users/check-phone/${this.testData.user.phone}`);
      const phoneData = await phoneCheckResponse.json();
      console.log('✅ Phone Check:', phoneData);
      
    } catch (error) {
      console.error('❌ User Management Error:', error);
    }
  }

  /**
   * 📋 Listing Management Tests
   */
  async testListingManagement() {
    console.log('\n📋 Testing Listing Management...');
    
    try {
      // 1. Get catalogue categories
      const categoriesResponse = await fetch(`${this.baseURL}/catalogue/categories`);
      const categories = await categoriesResponse.json();
      console.log('✅ Get Categories:', categories);
      
      // 2. Create a listing (mock data)
      const createListingResponse = await fetch(`${this.baseURL}/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId: this.userId,
          title: 'Test Tractor for Rent',
          description: 'Well-maintained tractor for farming',
          categoryId: '65f1a2b3c4d5e6f7g8h9i0j1', // Mock category ID
          subCategoryId: '65f1a2b3c4d5e6f7g8h9i0j2', // Mock subcategory ID
          photos: ['https://example.com/tractor.jpg'],
          coordinates: [77.5946, 12.9716],
          price: 500,
          unitOfMeasure: 'per_day',
          availableFrom: '2024-01-01T00:00:00.000Z',
          availableTo: '2024-12-31T23:59:59.000Z',
          tags: ['tractor', 'farming']
        })
      });
      
      const listingData = await createListingResponse.json();
      this.testData.listing = listingData;
      console.log('✅ Create Listing:', listingData);
      
      // 3. Get all listings
      const listingsResponse = await fetch(`${this.baseURL}/listings`);
      const listings = await listingsResponse.json();
      console.log('✅ Get All Listings:', listings);
      
      // 4. Get listings by provider
      const providerListingsResponse = await fetch(`${this.baseURL}/listings/provider/${this.userId}`);
      const providerListings = await providerListingsResponse.json();
      console.log('✅ Get Provider Listings:', providerListings);
      
    } catch (error) {
      console.error('❌ Listing Management Error:', error);
    }
  }

  /**
   * 🛒 Order Management Tests
   */
  async testOrderManagement() {
    console.log('\n🛒 Testing Order Management...');
    
    try {
      // 1. Create an order
      const createOrderResponse = await fetch(`${this.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: this.testData.listing?._id || '65f1a2b3c4d5e6f7g8h9i0j1',
          seekerId: this.userId,
          providerId: this.userId,
          orderType: 'rental',
          totalAmount: 500,
          serviceStartDate: '2024-01-15T00:00:00.000Z',
          serviceEndDate: '2024-01-16T00:00:00.000Z',
          quantity: 1,
          unitOfMeasure: 'per_day'
        })
      });
      
      const orderData = await createOrderResponse.json();
      this.testData.order = orderData;
      console.log('✅ Create Order:', orderData);
      
      // 2. Get all orders
      const ordersResponse = await fetch(`${this.baseURL}/orders`);
      const orders = await ordersResponse.json();
      console.log('✅ Get All Orders:', orders);
      
      // 3. Update order status
      const updateOrderResponse = await fetch(`${this.baseURL}/orders/${orderData._id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'accepted',
          updatedBy: this.userId
        })
      });
      
      const updatedOrder = await updateOrderResponse.json();
      console.log('✅ Update Order Status:', updatedOrder);
      
    } catch (error) {
      console.error('❌ Order Management Error:', error);
    }
  }

  /**
   * 💰 Escrow Management Tests
   */
  async testEscrowManagement() {
    console.log('\n💰 Testing Escrow Management...');
    
    try {
      // 1. Create escrow
      const createEscrowResponse = await fetch(`${this.baseURL}/escrow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: this.testData.order?._id || '65f1a2b3c4d5e6f7g8h9i0j1',
          seekerId: this.userId,
          providerId: this.userId,
          amount: 500,
          transactionId: `TXN${Date.now()}`
        })
      });
      
      const escrowData = await createEscrowResponse.json();
      this.testData.escrow = escrowData;
      console.log('✅ Create Escrow:', escrowData);
      
      // 2. Get escrow summary
      const escrowSummaryResponse = await fetch(`${this.baseURL}/escrow/summary`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      const escrowSummary = await escrowSummaryResponse.json();
      console.log('✅ Escrow Summary:', escrowSummary);
      
    } catch (error) {
      console.error('❌ Escrow Management Error:', error);
    }
  }

  /**
   * 💬 Chat System Tests
   */
  async testChatSystem() {
    console.log('\n💬 Testing Chat System...');
    
    try {
      // 1. Create conversation
      const createConversationResponse = await fetch(`${this.baseURL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantId: this.userId,
          relatedOrderId: this.testData.order?._id
        })
      });
      
      const conversationData = await createConversationResponse.json();
      this.testData.conversation = conversationData;
      console.log('✅ Create Conversation:', conversationData);
      
      // 2. Send message
      const sendMessageResponse = await fetch(`${this.baseURL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversationData._id,
          type: 'text',
          content: 'Hello! Is the tractor still available?'
        })
      });
      
      const messageData = await sendMessageResponse.json();
      console.log('✅ Send Message:', messageData);
      
      // 3. Get conversations
      const conversationsResponse = await fetch(`${this.baseURL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      const conversations = await conversationsResponse.json();
      console.log('✅ Get Conversations:', conversations);
      
    } catch (error) {
      console.error('❌ Chat System Error:', error);
    }
  }

  /**
   * ⭐ Ratings Tests
   */
  async testRatings() {
    console.log('\n⭐ Testing Ratings...');
    
    try {
      // 1. Create rating
      const createRatingResponse = await fetch(`${this.baseURL}/ratings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: this.testData.order?._id || '65f1a2b3c4d5e6f7g8h9i0j1',
          raterId: this.userId,
          ratedId: this.userId,
          score: 5,
          review: 'Excellent service! Equipment was in perfect condition.'
        })
      });
      
      const ratingData = await createRatingResponse.json();
      console.log('✅ Create Rating:', ratingData);
      
      // 2. Get ratings by user
      const ratingsResponse = await fetch(`${this.baseURL}/ratings/user/${this.userId}`);
      const ratings = await ratingsResponse.json();
      console.log('✅ Get User Ratings:', ratings);
      
    } catch (error) {
      console.error('❌ Ratings Error:', error);
    }
  }

  /**
   * 🚨 Dispute Tests
   */
  async testDisputes() {
    console.log('\n🚨 Testing Disputes...');
    
    try {
      // 1. Create dispute
      const createDisputeResponse = await fetch(`${this.baseURL}/disputes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: this.testData.order?._id || '65f1a2b3c4d5e6f7g8h9i0j1',
          againstUserId: this.userId,
          reason: 'Equipment not delivered on time',
          description: 'The tractor was supposed to be delivered on 15th Jan but never arrived.',
          evidenceUrls: ['https://example.com/evidence1.jpg']
        })
      });
      
      const disputeData = await createDisputeResponse.json();
      this.testData.dispute = disputeData;
      console.log('✅ Create Dispute:', disputeData);
      
      // 2. Get disputes
      const disputesResponse = await fetch(`${this.baseURL}/disputes`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      const disputes = await disputesResponse.json();
      console.log('✅ Get Disputes:', disputes);
      
    } catch (error) {
      console.error('❌ Disputes Error:', error);
    }
  }

  /**
   * 📄 KYC & Address Tests
   */
  async testKYCAndAddresses() {
    console.log('\n📄 Testing KYC & Addresses...');
    
    try {
      // 1. Create address
      const createAddressResponse = await fetch(`${this.baseURL}/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          tag: 'home',
          addressLine1: '123 Main Street',
          addressLine2: 'Near Post Office',
          village: 'Rampur',
          tehsil: 'Rampur',
          district: 'Rampur',
          state: 'Uttar Pradesh',
          pincode: '244901',
          coordinates: [77.5946, 12.9716],
          isDefault: true
        })
      });
      
      const addressData = await createAddressResponse.json();
      this.testData.address = addressData;
      console.log('✅ Create Address:', addressData);
      
      // 2. Get user addresses
      const addressesResponse = await fetch(`${this.baseURL}/addresses/user/${this.userId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      const addresses = await addressesResponse.json();
      console.log('✅ Get User Addresses:', addresses);
      
      // 3. Upload KYC document
      const kycResponse = await fetch(`${this.baseURL}/kyc/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.userId,
          docType: 'aadhar',
          docURL: 'https://example.com/aadhar.pdf',
          docNumber: '1234 5678 9012'
        })
      });
      
      const kycData = await kycResponse.json();
      console.log('✅ Upload KYC Document:', kycData);
      
    } catch (error) {
      console.error('❌ KYC & Address Error:', error);
    }
  }

  /**
   * 🧪 Run All Tests
   */
  async runAllTests() {
    console.log('🌾 Starting Rural Share API Tests...\n');
    
    await this.testAuthentication();
    await this.testUserManagement();
    await this.testListingManagement();
    await this.testOrderManagement();
    await this.testEscrowManagement();
    await this.testChatSystem();
    await this.testRatings();
    await this.testDisputes();
    await this.testKYCAndAddresses();
    
    console.log('\n🎉 All tests completed!');
    console.log('📊 Test Data Summary:', this.testData);
  }

  /**
   * 🔧 Helper Methods
   */
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    return fetch(`${this.baseURL}${endpoint}`, {
      ...defaultOptions,
      ...options
    });
  }

  /**
   * 🎯 Test Specific Endpoint
   */
  async testEndpoint(method, endpoint, data = null) {
    try {
      const options = {
        method: method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      const result = await response.json();
      
      console.log(`✅ ${method} ${endpoint}:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ ${method} ${endpoint} Error:`, error);
      throw error;
    }
  }
}

// Usage Examples
const tester = new RuralShareAPITester();

// Run all tests
// tester.runAllTests();

// Or test specific functionality
// tester.testAuthentication();
// tester.testListingManagement();

// Or test specific endpoint
// tester.testEndpoint('GET', '/users/65f1a2b3c4d5e6f7g8h9i0j1');

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RuralShareAPITester;
}

// For browser usage
if (typeof window !== 'undefined') {
  window.RuralShareAPITester = RuralShareAPITester;
}

/**
 * 🚀 Quick Start Guide for Frontend Engineers
 * 
 * 1. Include this script in your project
 * 2. Create an instance: const tester = new RuralShareAPITester();
 * 3. Run all tests: await tester.runAllTests();
 * 4. Check console for results and any errors
 * 5. Use the test data structure to understand API responses
 * 
 * Key Features:
 * - ✅ Complete API coverage
 * - ✅ Error handling examples
 * - ✅ Authentication management
 * - ✅ Real test data generation
 * - ✅ Helper methods for custom testing
 * - ✅ Browser and Node.js compatibility
 */ 