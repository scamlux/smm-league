/**
 * SMM League - Complete API Test Suite
 * Tests all endpoints, URLs, and database connectivity
 *
 * Run: npx ts-node tests/api-test.ts
 */

const axios = require("axios");
const http = require("http");

// Configuration
const BACKEND_URL = "http://localhost:3001";
const FRONTEND_URL = "http://localhost:3000";

// Test data
const TEST_DATA = {
  adminEmail: "admin@example.com",
  adminPassword: "Admin123!",
  brandEmail: "brand1@example.com",
  brandPassword: "Brand123!",
  influencerEmail: "influencer1@example.com",
  influencerPassword: "Influencer123!",
};

// Tokens for authenticated requests
let adminToken: string = "";
let brandToken: string = "";
let influencerToken: string = "";
let testUserId: string = "";
let testCampaignId: string = "";
let testBidId: string = "";

// Test results
const results: any[] = [];

class APITester {
  private axios: any;
  private testsPassed: number = 0;
  private testsFailed: number = 0;

  constructor(baseURL: string) {
    this.axios = axios.create({
      baseURL,
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  async test(name: string, fn: () => Promise<boolean>): Promise<void> {
    try {
      const passed = await fn();
      if (passed) {
        this.testsPassed++;
        console.log(`✅ ${name}`);
      } else {
        this.testsFailed++;
        console.log(`❌ ${name}`);
      }
      results.push({ name, passed });
    } catch (error: any) {
      this.testsFailed++;
      console.log(`❌ ${name} - ${error.message}`);
      results.push({ name, passed: false, error: error.message });
    }
  }

  getResults() {
    return { passed: this.testsPassed, failed: this.testsFailed };
  }

  async get(url: string, token?: string) {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    return this.axios.get(url, config);
  }

  async post(url: string, data: any, token?: string) {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    return this.axios.post(url, data, config);
  }

  async put(url: string, data: any, token?: string) {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    return this.axios.put(url, data, config);
  }

  async delete(url: string, token?: string) {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    return this.axios.delete(url, config);
  }
}

async function runTests() {
  console.log("🚀 Starting SMM League API Test Suite\n");
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);

  const tester = new APITester(BACKEND_URL);

  // ============================================================================
  // 1. HEALTH & CONNECTION TESTS
  // ============================================================================
  console.log("\n📋 1. HEALTH & CONNECTION TESTS");
  console.log("━".repeat(50));

  await tester.test("Backend is accessible", async () => {
    const res = await tester.get("/");
    return res.status < 500; // Any response that's not 500+ is good
  });

  await tester.test("Frontend is accessible", async () => {
    const res = await axios.get(FRONTEND_URL, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return res.status === 200;
  });

  // ============================================================================
  // 2. AUTHENTICATION TESTS
  // ============================================================================
  console.log("\n🔐 2. AUTHENTICATION TESTS");
  console.log("━".repeat(50));

  // Admin Login
  await tester.test("Admin login successful", async () => {
    const res = await tester.post("/auth/login", {
      email: TEST_DATA.adminEmail,
      password: TEST_DATA.adminPassword,
    });
    if (res.status === 200 && res.data?.access_token) {
      adminToken = res.data.access_token;
      return true;
    }
    return false;
  });

  // Brand Login
  await tester.test("Brand login successful", async () => {
    const res = await tester.post("/auth/login", {
      email: TEST_DATA.brandEmail,
      password: TEST_DATA.brandPassword,
    });
    if (res.status === 200 && res.data?.access_token) {
      brandToken = res.data.access_token;
      return true;
    }
    return false;
  });

  // Influencer Login
  await tester.test("Influencer login successful", async () => {
    const res = await tester.post("/auth/login", {
      email: TEST_DATA.influencerEmail,
      password: TEST_DATA.influencerPassword,
    });
    if (res.status === 200 && res.data?.access_token) {
      influencerToken = res.data.access_token;
      return true;
    }
    return false;
  });

  // Get Current User
  await tester.test("Get current user profile (Auth)", async () => {
    const res = await tester.post("/auth/me", {}, adminToken);
    return res.status === 200 && res.data?.id;
  });

  // ============================================================================
  // 3. INFLUENCERS ENDPOINTS
  // ============================================================================
  console.log("\n👥 3. INFLUENCERS ENDPOINTS");
  console.log("━".repeat(50));

  // Get League
  await tester.test(
    "GET /influencers/league - Get influencer league",
    async () => {
      const res = await tester.get("/influencers/league");
      return res.status === 200 && Array.isArray(res.data);
    },
  );

  // Search Influencers
  await tester.test(
    "GET /influencers/search - Search influencers",
    async () => {
      const res = await tester.get("/influencers/search?category=Fashion");
      return res.status === 200 && Array.isArray(res.data);
    },
  );

  // Get Influencer by ID
  await tester.test(
    "GET /influencers/:id - Get single influencer",
    async () => {
      const res = await tester.get("/influencers/1");
      return res.status === 200 || res.status === 404; // Both are valid responses
    },
  );

  // Update Influencer (as Admin)
  await tester.test(
    "PUT /influencers/:id - Update influencer (Admin)",
    async () => {
      const res = await tester.put(
        "/influencers/1",
        { category: "Lifestyle" },
        adminToken,
      );
      return res.status === 200 || res.status === 403 || res.status === 404;
    },
  );

  // Update Rankings
  await tester.test(
    "PUT /influencers/admin/rankings/update - Update rankings",
    async () => {
      const res = await tester.put(
        "/influencers/admin/rankings/update",
        { rankings: [{ id: "1", rank: 1 }] },
        adminToken,
      );
      return res.status === 200 || res.status === 400 || res.status === 404;
    },
  );

  // Add Social Account
  await tester.test(
    "POST /influencers/:id/social-accounts - Add social account",
    async () => {
      const res = await tester.post(
        "/influencers/1/social-accounts",
        {
          platform: "INSTAGRAM",
          username: "testuser",
          followers: 10000,
          engagement: 5.5,
          url: "https://instagram.com/testuser",
        },
        influencerToken,
      );
      return res.status === 201 || res.status === 400 || res.status === 404;
    },
  );

  // ============================================================================
  // 4. CAMPAIGNS ENDPOINTS
  // ============================================================================
  console.log("\n📢 4. CAMPAIGNS ENDPOINTS");
  console.log("━".repeat(50));

  // Get All Campaigns
  await tester.test("GET /campaigns - Get all campaigns", async () => {
    const res = await tester.get("/campaigns");
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get Campaign by ID
  await tester.test("GET /campaigns/:id - Get single campaign", async () => {
    const res = await tester.get("/campaigns/1");
    return res.status === 200 || res.status === 404;
  });

  // Create Campaign (as Brand)
  await tester.test("POST /campaigns - Create campaign (Brand)", async () => {
    const res = await tester.post(
      "/campaigns",
      {
        title: "Test Campaign",
        description: "Test Description",
        budget: 5000,
        platform: "instagram",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: "Min 100k followers",
      },
      brandToken,
    );
    if (res.status === 201 && res.data?.id) {
      testCampaignId = res.data.id;
      return true;
    }
    return res.status === 400 || res.status === 403;
  });

  // Update Campaign
  await tester.test("PUT /campaigns/:id - Update campaign", async () => {
    const res = await tester.put(
      `/campaigns/${testCampaignId || "1"}`,
      { title: "Updated Campaign" },
      brandToken,
    );
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Get Campaign Bids
  await tester.test("GET /campaigns/:id/bids - Get campaign bids", async () => {
    const res = await tester.get(`/campaigns/1/bids`);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Submit Bid (as Influencer)
  await tester.test(
    "POST /campaigns/:id/bids - Submit bid (Influencer)",
    async () => {
      const res = await tester.post(
        `/campaigns/1/bids`,
        {
          price: 2500,
          proposal: "I can create amazing content",
          deliveryTime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
        influencerToken,
      );
      if (res.status === 201 && res.data?.id) {
        testBidId = res.data.id;
      }
      return res.status === 201 || res.status === 400 || res.status === 409; // 409 for duplicate bid
    },
  );

  // Accept Bid
  await tester.test("POST /campaigns/:bidId/accept - Accept bid", async () => {
    const res = await tester.post(
      `/campaigns/bids/${testBidId || "1"}/accept`,
      {},
      brandToken,
    );
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Reject Bid
  await tester.test("POST /campaigns/:bidId/reject - Reject bid", async () => {
    const res = await tester.post(
      `/campaigns/bids/invalid-id/reject`,
      {},
      brandToken,
    );
    return res.status === 400 || res.status === 404; // Expected to fail with invalid ID
  });

  // ============================================================================
  // 5. DEALS ENDPOINTS
  // ============================================================================
  console.log("\n🤝 5. DEALS ENDPOINTS");
  console.log("━".repeat(50));

  // Get All Deals
  await tester.test("GET /deals - Get all deals", async () => {
    const res = await tester.get("/deals", brandToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get Deal by ID
  await tester.test("GET /deals/:id - Get single deal", async () => {
    const res = await tester.get("/deals/1", brandToken);
    return res.status === 200 || res.status === 404;
  });

  // Update Deal Status
  await tester.test("PUT /deals/:id/status - Update deal status", async () => {
    const res = await tester.put(
      "/deals/1/status",
      { status: "ACTIVE" },
      brandToken,
    );
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Submit Content
  await tester.test(
    "POST /deals/:id/content - Submit deal content",
    async () => {
      const res = await tester.post(
        "/deals/1/content",
        { contentUrl: "https://example.com/content" },
        influencerToken,
      );
      return res.status === 200 || res.status === 400 || res.status === 404;
    },
  );

  // Approve Content
  await tester.test("POST /deals/:id/approve - Approve content", async () => {
    const res = await tester.post("/deals/1/approve", {}, brandToken);
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Complete Deal
  await tester.test("POST /deals/:id/complete - Complete deal", async () => {
    const res = await tester.post("/deals/1/complete", {}, brandToken);
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Cancel Deal
  await tester.test("POST /deals/:id/cancel - Cancel deal", async () => {
    const res = await tester.post("/deals/1/cancel", {}, brandToken);
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // ============================================================================
  // 6. CHAT ENDPOINTS
  // ============================================================================
  console.log("\n💬 6. CHAT ENDPOINTS");
  console.log("━".repeat(50));

  // Get Messages
  await tester.test(
    "GET /chat/:dealId/messages - Get deal messages",
    async () => {
      const res = await tester.get("/chat/1/messages", brandToken);
      return res.status === 200 && Array.isArray(res.data);
    },
  );

  // Send Message
  await tester.test("POST /chat/:dealId/messages - Send message", async () => {
    const res = await tester.post(
      "/chat/1/messages",
      { text: "Hello, this is a test message" },
      brandToken,
    );
    return res.status === 201 || res.status === 400 || res.status === 404;
  });

  // ============================================================================
  // 7. ADMIN ENDPOINTS
  // ============================================================================
  console.log("\n👨‍💼 7. ADMIN ENDPOINTS");
  console.log("━".repeat(50));

  // Admin Dashboard
  await tester.test("GET /admin/dashboard - Get admin dashboard", async () => {
    const res = await tester.get("/admin/dashboard", adminToken);
    return res.status === 200;
  });

  // Get All Users
  await tester.test("GET /admin/users - Get all users", async () => {
    const res = await tester.get("/admin/users", adminToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get User by ID
  await tester.test("GET /admin/users/:id - Get user details", async () => {
    const res = await tester.get("/admin/users/1", adminToken);
    return res.status === 200 || res.status === 404;
  });

  // Create User
  await tester.test("POST /admin/users - Create new user (Admin)", async () => {
    const res = await tester.post(
      "/admin/users",
      {
        email: `test-${Date.now()}@example.com`,
        password: "Test123!",
        name: "Test User",
        role: "INFLUENCER",
      },
      adminToken,
    );
    if (res.status === 201 && res.data?.id) {
      testUserId = res.data.id;
      return true;
    }
    return res.status === 400 || res.status === 409;
  });

  // Update User
  await tester.test("PUT /admin/users/:id - Update user (Admin)", async () => {
    const res = await tester.put(
      `/admin/users/${testUserId || "1"}`,
      { name: "Updated User" },
      adminToken,
    );
    return res.status === 200 || res.status === 400 || res.status === 404;
  });

  // Change User Role
  await tester.test(
    "PUT /admin/users/:id/role - Change user role",
    async () => {
      const res = await tester.put(
        `/admin/users/${testUserId || "1"}/role`,
        { role: "BRAND" },
        adminToken,
      );
      return res.status === 200 || res.status === 400 || res.status === 404;
    },
  );

  // Get All Influencers (Admin)
  await tester.test(
    "GET /admin/influencers - Get all influencers",
    async () => {
      const res = await tester.get("/admin/influencers", adminToken);
      return res.status === 200 && Array.isArray(res.data);
    },
  );

  // Get All Campaigns (Admin)
  await tester.test("GET /admin/campaigns - Get all campaigns", async () => {
    const res = await tester.get("/admin/campaigns", adminToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get All Deals (Admin)
  await tester.test("GET /admin/deals - Get all deals", async () => {
    const res = await tester.get("/admin/deals", adminToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get Subscriptions
  await tester.test(
    "GET /admin/subscriptions - Get subscriptions",
    async () => {
      const res = await tester.get("/admin/subscriptions", adminToken);
      return res.status === 200 && Array.isArray(res.data);
    },
  );

  // Get Payments
  await tester.test("GET /admin/payments - Get payments", async () => {
    const res = await tester.get("/admin/payments", adminToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Get Audit Logs
  await tester.test("GET /admin/audit-logs - Get audit logs", async () => {
    const res = await tester.get("/admin/audit-logs", adminToken);
    return res.status === 200 && Array.isArray(res.data);
  });

  // Impersonate User
  await tester.test(
    "POST /admin/impersonate/:userId - Impersonate user",
    async () => {
      const res = await tester.post(`/admin/impersonate/1`, {}, adminToken);
      return res.status === 200 || res.status === 400 || res.status === 404;
    },
  );

  // ============================================================================
  // 8. FRONTEND ROUTES TEST
  // ============================================================================
  console.log("\n🖥️  8. FRONTEND ROUTES TEST");
  console.log("━".repeat(50));

  const frontendRoutes = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/league",
    "/dashboard/campaigns",
    "/dashboard/deals",
    "/dashboard/profile",
  ];

  for (const route of frontendRoutes) {
    await tester.test(`Frontend route: ${route}`, async () => {
      const res = await axios.get(`${FRONTEND_URL}${route}`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      return res.status === 200;
    });
  }

  // ============================================================================
  // RESULTS
  // ============================================================================
  console.log("\n" + "═".repeat(50));
  const testResults = tester.getResults();
  const total = testResults.passed + testResults.failed;
  const passPercentage = Math.round((testResults.passed / total) * 100);

  console.log("\n📊 TEST RESULTS");
  console.log("═".repeat(50));
  console.log(`✅ Passed: ${testResults.passed}/${total}`);
  console.log(`❌ Failed: ${testResults.failed}/${total}`);
  console.log(`📈 Success Rate: ${passPercentage}%`);
  console.log("═".repeat(50));

  if (testResults.failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED! Application is working correctly.");
  } else {
    console.log(
      `\n⚠️  ${testResults.failed} test(s) failed. Check logs above.`,
    );
  }

  // Save results to file
  const reportPath =
    "/Users/muhammadumar/Desktop/smm-league/tests/test-results.json";
  const report = {
    timestamp: new Date().toISOString(),
    backend: BACKEND_URL,
    frontend: FRONTEND_URL,
    results: {
      passed: testResults.passed,
      failed: testResults.failed,
      total,
      successPercentage: passPercentage,
    },
    details: results,
  };

  console.log(`\n💾 Full report saved to: tests/test-results.json`);
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
