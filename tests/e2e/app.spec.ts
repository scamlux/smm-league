import { test, expect, chromium } from "@playwright/test";

// Test configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:3001";

test.describe("SMM League E2E Tests", () => {
  test.beforeEach(async () => {
    // Clean up before each test
  });

  test.afterEach(async () => {
    // Cleanup after each test
  });

  test.describe("Authentication Flow", () => {
    test("should display login page correctly", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);

      await expect(page.locator("h1")).toContainText("SMM League");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("should navigate to register page", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.click('a[href="/auth/register"]');

      await expect(page).toHaveURL(/\/auth\/register/);
      await expect(page.locator("h1")).toContainText("SMM League");
    });

    test("should show error on invalid login", async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "invalid@test.com");
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');

      // Check for error message
      await expect(page.locator(".text-red-400")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should login successfully with valid credentials", async ({
      page,
    }) => {
      // This test uses seeded test data
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "brand1@example.com");
      await page.fill('input[type="password"]', "Brand123!");
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/brand\/dashboard/, { timeout: 10000 });
    });
  });

  test.describe("Brand Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      // Login as brand before each test in this describe block
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "brand1@example.com");
      await page.fill('input[type="password"]', "Brand123!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/brand\/dashboard/, { timeout: 10000 });
    });

    test("should display brand dashboard", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("SMM League");
      await expect(page.locator("text=Brand Dashboard")).toBeVisible();
    });

    test("should display stats cards", async ({ page }) => {
      await expect(page.locator("text=Active Campaigns")).toBeVisible();
      await expect(page.locator("text=Active Deals")).toBeVisible();
      await expect(page.locator("text=Subscribed")).toBeVisible();
    });

    test("should navigate to league page", async ({ page }) => {
      await page.click('a[href="/brand/league"]');
      await expect(page).toHaveURL(/\/brand\/league/);
    });

    test("should navigate to campaigns page", async ({ page }) => {
      await page.click('a[href="/brand/campaigns"]');
      await expect(page).toHaveURL(/\/brand\/campaigns/);
    });

    test("should navigate to deals page", async ({ page }) => {
      await page.click('a[href="/brand/deals"]');
      await expect(page).toHaveURL(/\/brand\/deals/);
    });
  });

  test.describe("Influencer Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      // Login as influencer
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "influencer1@example.com");
      await page.fill('input[type="password"]', "Influencer123!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/influencer\/dashboard/, { timeout: 10000 });
    });

    test("should display influencer dashboard", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("SMM League");
      await expect(page.locator("text=Influencer Dashboard")).toBeVisible();
    });

    test("should display influencer stats", async ({ page }) => {
      await expect(page.locator("text=Your Rank")).toBeVisible();
      await expect(page.locator("text=Active Deals")).toBeVisible();
    });
  });

  test.describe("Admin Dashboard", () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "admin@example.com");
      await page.fill('input[type="password"]', "Admin123!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    });

    test("should display admin dashboard", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Admin Panel");
      await expect(page.locator("text=God Mode")).toBeVisible();
    });

    test("should display admin stats", async ({ page }) => {
      await expect(page.locator("text=Total Users")).toBeVisible();
      await expect(page.locator("text=Influencers")).toBeVisible();
      await expect(page.locator("text=Campaigns")).toBeVisible();
    });

    test("should navigate to user management", async ({ page }) => {
      await page.click('a[href="/admin/users"]');
      await expect(page).toHaveURL(/\/admin\/users/);
    });
  });

  test.describe("Home Page Redirect", () => {
    test("should redirect to login when not authenticated", async ({
      page,
    }) => {
      await page.goto(BASE_URL);
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect to appropriate dashboard based on role", async ({
      page,
    }) => {
      // Login as brand
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[type="email"]', "brand1@example.com");
      await page.fill('input[type="password"]', "Brand123!");
      await page.click('button[type="submit"]');

      // Should be redirected to brand dashboard
      await expect(page).toHaveURL(/\/brand\/dashboard/);
    });
  });

  test.describe("UI Responsiveness", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`${BASE_URL}/auth/login`);
      await expect(page.locator("h1")).toContainText("SMM League");

      // Form should still be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test("should work on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(`${BASE_URL}/auth/login`);
      await expect(page.locator("h1")).toContainText("SMM League");
    });
  });

  test.describe("API Connectivity", () => {
    test("backend should be accessible", async ({ page }) => {
      const response = await page.request.get(`${API_URL}/influencers/league`);
      expect(response.status()).toBe(200);
    });

    test("health check should pass", async ({ page }) => {
      const response = await page.request.get(`${API_URL}/`);
      expect(response.status()).toBeLessThan(500);
    });
  });
});

// ==================== CUSTOM MATCHERS ====================

test.extend({
  customMatch: async ({ page }, use) => {
    await use((locator) => locator.isVisible());
  },
});

// ==================== TEST FIXTURES ====================

test.use({
  storageState: undefined, // Don't persist auth state between tests
  locale: "en-US",
  timezoneId: "UTC",
});
