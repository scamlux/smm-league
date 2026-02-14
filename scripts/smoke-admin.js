/* eslint-disable no-console */
const axios = require("axios");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const now = Date.now();

const adminUser = {
  email: `admin-smoke-${now}@example.com`,
  password: "Admin123!",
  name: "Smoke Admin",
};

function ok(name) {
  console.log(`✓ ${name}`);
}

async function request(method, path, token, data) {
  const response = await axios({
    method,
    url: `${BASE_URL}${path}`,
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(
      `${method.toUpperCase()} ${path} failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
  }

  if (response.data && typeof response.data === "object" && "success" in response.data) {
    if (!response.data.success) {
      throw new Error(`${method.toUpperCase()} ${path} returned success=false`);
    }
    return response.data.data;
  }
  return response.data;
}

async function ensureAdmin() {
  const passwordHash = await bcrypt.hash(adminUser.password, 10);
  await prisma.user.create({
    data: {
      email: adminUser.email,
      password: passwordHash,
      name: adminUser.name,
      role: "ADMIN",
    },
  });
  ok("seed admin user");
}

async function main() {
  await ensureAdmin();

  const adminLogin = await request("post", "/auth/login", null, {
    email: adminUser.email,
    password: adminUser.password,
  });
  ok("auth/login admin");
  const adminToken = adminLogin.token;

  // Base admin reads
  await request("get", "/admin/dashboard", adminToken);
  ok("admin/dashboard");
  await request("get", "/admin/users", adminToken);
  ok("admin/users list");
  await request("get", "/admin/influencers", adminToken);
  ok("admin/influencers list");
  await request("get", "/admin/campaigns", adminToken);
  ok("admin/campaigns list");
  await request("get", "/admin/deals", adminToken);
  ok("admin/deals list");
  await request("get", "/admin/subscriptions", adminToken);
  ok("admin/subscriptions list");
  await request("get", "/admin/payments", adminToken);
  ok("admin/payments list");
  await request("get", "/admin/audit-logs", adminToken);
  ok("admin/audit-logs");

  // Create user -> update -> role switch -> subscription -> payment -> delete
  const managedUser = await request("post", "/admin/users", adminToken, {
    email: `managed-${now}@example.com`,
    password: "Managed123!",
    name: "Managed User",
    role: "BRAND",
  });
  ok("admin/users create");

  await request("get", `/admin/users/${managedUser.id}`, adminToken);
  ok("admin/users/:id get");

  await request("put", `/admin/users/${managedUser.id}`, adminToken, {
    name: "Managed User Updated",
  });
  ok("admin/users/:id update");

  await request("put", `/admin/users/${managedUser.id}/role`, adminToken, {
    role: "INFLUENCER",
  });
  ok("admin/users/:id/role switch");

  await request("post", "/admin/subscriptions", adminToken, {
    userId: managedUser.id,
    tier: "pro",
    durationDays: 30,
  });
  ok("admin/subscriptions activate");

  await request("post", "/admin/payments", adminToken, {
    userId: managedUser.id,
    amount: 49.99,
    type: "subscription",
  });
  ok("admin/payments create");

  await request("post", `/admin/subscriptions/${managedUser.id}/deactivate`, adminToken);
  ok("admin/subscriptions deactivate");

  await request("delete", `/admin/users/${managedUser.id}`, adminToken);
  ok("admin/users/:id delete");

  console.log("\nSmoke Admin API passed.");
}

main()
  .catch((error) => {
    console.error("\nSmoke Admin API failed:");
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

