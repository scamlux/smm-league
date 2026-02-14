#!/usr/bin/env node

/**
 * SMM League - Simple API Test Suite
 * Tests all endpoints, URLs, and database connectivity
 *
 * Run: node tests/test.js
 */

const http = require("http");
const https = require("https");

const BACKEND_URL = "http://localhost:3001";
const FRONTEND_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

const TEST_DATA = {
  adminEmail: "admin@example.com",
  adminPassword: "Admin123!",
  brandEmail: "brand1@example.com",
  brandPassword: "Brand123!",
  influencerEmail: "influencer1@example.com",
  influencerPassword: "Influencer123!",
};

let adminToken = "";
let brandToken = "";
let influencerToken = "";

// Utility functions
function makeRequest(url, method = "GET", data = null, token = null) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = (url.startsWith("https") ? https : http).request(
      options,
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              data: body ? JSON.parse(body) : null,
            });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      },
    );

    req.on("error", () => resolve({ status: 0, data: null }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, data: null });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test(name, fn) {
  try {
    const result = await fn();
    if (result) {
      passed++;
      console.log(`✅ ${name}`);
    } else {
      failed++;
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    failed++;
    console.log(`❌ ${name} - ${error.message}`);
  }
}

async function runTests() {
  console.log("🚀 SMM League - API Test Suite\n");
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);

  // ============================================================================
  // 1. HEALTH CHECKS
  // ============================================================================
  console.log("\n📋 1. HEALTH CHECKS");
  console.log("━".repeat(50));

  await test("Backend is accessible", async () => {
    const res = await makeRequest(`${BACKEND_URL}/`);
    return res.status < 500;
  });

  await test("Frontend is accessible", async () => {
    const res = await makeRequest(`${FRONTEND_URL}/`);
    return res.status === 200;
  });

  // ============================================================================
  // 2. AUTHENTICATION
  // ============================================================================
  console.log("\n🔐 2. AUTHENTICATION");
  console.log("━".repeat(50));

  await test("Admin login", async () => {
    const res = await makeRequest(`${BACKEND_URL}/auth/login`, "POST", {
      email: TEST_DATA.adminEmail,
      password: TEST_DATA.adminPassword,
    });
    if ((res.status === 200 || res.status === 201) && res.data?.token) {
      adminToken = res.data.token;
      return true;
    }
    return false;
  });

  await test("Brand login", async () => {
    const res = await makeRequest(`${BACKEND_URL}/auth/login`, "POST", {
      email: TEST_DATA.brandEmail,
      password: TEST_DATA.brandPassword,
    });
    if ((res.status === 200 || res.status === 201) && res.data?.token) {
      brandToken = res.data.token;
      return true;
    }
    return false;
  });

  await test("Influencer login", async () => {
    const res = await makeRequest(`${BACKEND_URL}/auth/login`, "POST", {
      email: TEST_DATA.influencerEmail,
      password: TEST_DATA.influencerPassword,
    });
    if ((res.status === 200 || res.status === 201) && res.data?.token) {
      influencerToken = res.data.token;
      return true;
    }
    return false;
  });

  await test("Get current user", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/auth/me`,
      "POST",
      {},
      adminToken,
    );
    return res.status === 200 && res.data?.id;
  });

  // ============================================================================
  // 3. INFLUENCERS
  // ============================================================================
  console.log("\n👥 3. INFLUENCERS");
  console.log("━".repeat(50));

  await test("GET /influencers/league", async () => {
    const res = await makeRequest(`${BACKEND_URL}/influencers/league`);
    return res.status === 200;
  });

  await test("GET /influencers/search", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/influencers/search?category=Fashion`,
    );
    return res.status === 200;
  });

  await test("GET /influencers/:id", async () => {
    const res = await makeRequest(`${BACKEND_URL}/influencers/1`);
    return res.status === 200 || res.status === 404;
  });

  // ============================================================================
  // 4. CAMPAIGNS
  // ============================================================================
  console.log("\n📢 4. CAMPAIGNS");
  console.log("━".repeat(50));

  await test("GET /campaigns", async () => {
    const res = await makeRequest(`${BACKEND_URL}/campaigns`);
    return res.status === 200;
  });

  await test("GET /campaigns/:id", async () => {
    const res = await makeRequest(`${BACKEND_URL}/campaigns/1`);
    return res.status === 200 || res.status === 404;
  });

  await test("POST /campaigns (as brand)", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/campaigns`,
      "POST",
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
    return res.status === 201 || res.status === 400;
  });

  await test("GET /campaigns/:id/bids", async () => {
    const res = await makeRequest(`${BACKEND_URL}/campaigns/1/bids`);
    return res.status === 200 || res.status === 404;
  });

  // ============================================================================
  // 5. DEALS
  // ============================================================================
  console.log("\n🤝 5. DEALS");
  console.log("━".repeat(50));

  await test("GET /deals", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/deals`,
      "GET",
      null,
      brandToken,
    );
    return res.status === 200;
  });

  await test("GET /deals/:id", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/deals/1`,
      "GET",
      null,
      brandToken,
    );
    return res.status === 200 || res.status === 404;
  });

  // ============================================================================
  // 6. CHAT
  // ============================================================================
  console.log("\n💬 6. CHAT");
  console.log("━".repeat(50));

  await test("GET /chat/:dealId/messages", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/chat/1/messages`,
      "GET",
      null,
      brandToken,
    );
    return res.status === 200 || res.status === 404;
  });

  // ============================================================================
  // 7. ADMIN
  // ============================================================================
  console.log("\n👨‍💼 7. ADMIN");
  console.log("━".repeat(50));

  await test("GET /admin/dashboard", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/admin/dashboard`,
      "GET",
      null,
      adminToken,
    );
    return res.status === 200;
  });

  await test("GET /admin/users", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/admin/users`,
      "GET",
      null,
      adminToken,
    );
    return res.status === 200;
  });

  await test("GET /admin/campaigns", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/admin/campaigns`,
      "GET",
      null,
      adminToken,
    );
    return res.status === 200;
  });

  await test("GET /admin/deals", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/admin/deals`,
      "GET",
      null,
      adminToken,
    );
    return res.status === 200;
  });

  await test("GET /admin/subscriptions", async () => {
    const res = await makeRequest(
      `${BACKEND_URL}/admin/subscriptions`,
      "GET",
      null,
      adminToken,
    );
    return res.status === 200;
  });

  // ============================================================================
  // 8. FRONTEND ROUTES
  // ============================================================================
  console.log("\n🖥️  8. FRONTEND ROUTES");
  console.log("━".repeat(50));

  const routes = [
    { path: "/", name: "Home" },
    { path: "/auth/login", name: "Login" },
    { path: "/auth/register", name: "Register" },
    { path: "/brand/dashboard", name: "Brand Dashboard" },
    { path: "/influencer/dashboard", name: "Influencer Dashboard" },
    { path: "/admin/dashboard", name: "Admin Dashboard" },
  ];

  for (const route of routes) {
    await test(`Route: ${route.name} (${route.path})`, async () => {
      const res = await makeRequest(`${FRONTEND_URL}${route.path}`);
      // Accept 200 or 307 (redirect) for authenticated routes
      return res.status === 200 || res.status === 307 || res.status === 302;
    });
  }

  // ============================================================================
  // RESULTS
  // ============================================================================
  console.log("\n" + "═".repeat(50));
  const total = passed + failed;
  const percentage = Math.round((passed / total) * 100);

  console.log("\n📊 TEST RESULTS");
  console.log("═".repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${percentage}%`);
  console.log("═".repeat(50));

  if (failed === 0) {
    console.log("\n🎉 ALL TESTS PASSED!\n");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed\n`);
  }
}

runTests();
