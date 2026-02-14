// k6 Load Test Configuration for SMM League API
// Run with: k6 run tests/load/scenarios.js

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import {
  randomString,
  randomIntBetween,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Custom metrics
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");
const requestsFailed = new Counter("requests_failed");

// Test configuration
export const options = {
  // Smoke test: 1 virtual user, 1 iteration
  // Run: k6 run --env VUS=1 --env ITERATIONS=1 tests/load/scenarios.js

  // Load test: 100 virtual users, 10 minutes
  // Run: k6 run --env VUS=100 --env DURATION=10m tests/load/scenarios.js

  // Stress test: 500 virtual users, 5 minutes
  // Run: k6 run --env VUS=500 --env DURATION=5m tests/load/scenarios.js

  vus: parseInt(__ENV.VUS) || 10,
  iterations: parseInt(__ENV.ITERATIONS) || 100,
  duration: __ENV.DURATION || "2m",

  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"], // 95% under 500ms, 99% under 1s
    http_req_failed: ["rate<0.01"], // Less than 1% errors
    errors: ["rate<0.05"], // Less than 5% custom error rate
    response_time: ["avg<200"], // Average response time under 200ms
  },

  setupTimeout: "30s",
  teardownTimeout: "30s",
};

// Test data
const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";
const testData = {
  emails: [],
  passwords: "Password123!",
};

// Generate test users
function generateTestUser(index) {
  return {
    email: `loadtest${index}@test.com`,
    name: `Load Test User ${index}`,
    role: index % 3 === 0 ? "BRAND" : "INFLUENCER",
  };
}

// Setup function - runs once before the test
export function setup() {
  console.log(`🚀 Starting load test with ${options.vus} VUs`);
  console.log(`📊 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Duration: ${options.duration}`);

  // Pre-generate test users
  const users = [];
  for (let i = 0; i < options.vus * 10; i++) {
    users.push(generateTestUser(i));
  }

  return { users };
}

// Teardown function - runs once after the test
export function teardown(data) {
  console.log(`✅ Load test completed`);
  console.log(`📝 Total requests: ${__ITER}`);
}

// Main test function - runs for each VU iteration
export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];

  // Scenario 1: Health check
  scenarioHealthCheck();

  // Scenario 2: User registration and login
  const token = scenarioAuth(user);

  // Scenario 3: Browse influencers (public endpoint)
  scenarioBrowseInfluencers();

  // Scenario 4: View campaigns
  scenarioViewCampaigns(token);

  // Scenario 5: Brand workflow (if brand user)
  if (user.role === "BRAND") {
    scenarioBrandWorkflow(token);
  }

  // Scenario 6: Influencer workflow (if influencer user)
  if (user.role === "INFLUENCER") {
    scenarioInfluencerWorkflow(token);
  }

  sleep(randomIntBetween(1, 3));
}

// ==================== SCENARIOS ====================

function scenarioHealthCheck() {
  const start = Date.now();

  const response = http.get(`${BASE_URL}/`, {
    headers: { "Content-Type": "application/json" },
  });

  const duration = Date.now() - start;
  responseTime.add(duration);

  check(response, {
    "health check responds": (r) => r.status < 500,
  }) || errorRate.add(1);
}

function scenarioAuth(user) {
  let token = null;

  // Try to login first
  const loginResponse = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: user.email,
      password: testData.passwords,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  if (loginResponse.status === 200) {
    token = loginResponse.json("token");
  } else {
    // Register new user
    const registerResponse = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({
        email: user.email,
        password: testData.passwords,
        name: user.name,
        role: user.role,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (registerResponse.status === 201) {
      token = registerResponse.json("token");
    }
  }

  check(null, {
    "auth successful": () => token !== null,
  }) || errorRate.add(1);

  return token;
}

function scenarioBrowseInfluencers() {
  const endpoints = [
    "/influencers/league",
    "/influencers/search?category=Fashion",
    "/influencers/search?platform=instagram",
  ];

  const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];

  const response = http.get(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
  });

  check(response, {
    "influencers endpoint responds": (r) => r.status < 500,
    "influencers returns array": (r) => Array.isArray(r.json("data")),
  }) || errorRate.add(1);
}

function scenarioViewCampaigns(token) {
  const response = http.get(`${BASE_URL}/campaigns`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  check(response, {
    "campaigns endpoint responds": (r) => r.status < 500,
    "campaigns returns array": (r) => Array.isArray(r.json("data")),
  }) || errorRate.add(1);
}

function scenarioBrandWorkflow(token) {
  if (!token) return;

  // Create campaign
  const campaignData = {
    title: `Load Test Campaign ${randomString(8)}`,
    description: `Performance test campaign - ${Date.now()}`,
    budget: randomIntBetween(1000, 10000),
    platform: ["instagram", "youtube", "tiktok"][randomIntBetween(0, 2)],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: "Load test requirements",
  };

  const createResponse = http.post(
    `${BASE_URL}/campaigns`,
    JSON.stringify(campaignData),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  let campaignId = null;
  if (createResponse.status === 201) {
    campaignId = createResponse.json("data.id");
  }

  check(createResponse, {
    "campaign creation responds": (r) => r.status < 500,
  }) || errorRate.add(1);

  // View deals
  const dealsResponse = http.get(`${BASE_URL}/deals`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  check(dealsResponse, {
    "deals endpoint responds": (r) => r.status < 500,
  }) || errorRate.add(1);
}

function scenarioInfluencerWorkflow(token) {
  if (!token) return;

  // View league
  const leagueResponse = http.get(`${BASE_URL}/influencers/league`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  check(leagueResponse, {
    "league endpoint responds": (r) => r.status < 500,
  }) || errorRate.add(1);

  // View campaigns
  const campaignsResponse = http.get(`${BASE_URL}/campaigns`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  check(campaignsResponse, {
    "campaigns for influencer responds": (r) => r.status < 500,
  }) || errorRate.add(1);
}

// ==================== BREAKPOINT TEST ====================

export function handleBreakpoint(data) {
  // Custom handler for breakpoint tests
  console.log("Breakpoint test completed");
}

// ==================== GRADUAL RAMP TEST ====================

export function handleRampUp(data) {
  // Custom handler for gradual ramp-up tests
  console.log(`Ramping up: ${__VU} active users`);
}
