import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../apps/backend/src/modules/app.module";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../apps/backend/src/common/prisma.service";
import * as bcrypt from "bcrypt";

describe("Auth API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Create admin user for protected routes
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@test.com" },
      update: {},
      create: {
        email: "admin@test.com",
        password: hashedPassword,
        name: "Test Admin",
        role: "ADMIN",
      },
    });

    adminToken = jwtService.sign({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: { contains: "@test.com" } },
    });
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should register a new brand", async () => {
      const registerDto = {
        email: `brand-${Date.now()}@test.com`,
        password: "Password123!",
        name: "Test Brand",
        role: "BRAND",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.role).toBe("BRAND");
    });

    it("should reject duplicate email", async () => {
      const duplicateDto = {
        email: "admin@test.com",
        password: "Password123!",
        name: "Duplicate User",
        role: "BRAND",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(duplicateDto)
        .expect(500);

      expect(response.body.error.code).toBeDefined();
    });

    it("should reject invalid email format", async () => {
      const invalidDto = {
        email: "invalid-email",
        password: "Password123!",
        name: "Test User",
        role: "BRAND",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(invalidDto)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject short password", async () => {
      const shortPasswordDto = {
        email: "test@test.com",
        password: "123",
        name: "Test User",
        role: "BRAND",
      };

      const response = await request(app.getHttpServer())
        .post("/auth/register")
        .send(shortPasswordDto)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /auth/login", () => {
    let testUserToken: string;
    let testUserEmail: string;

    beforeAll(async () => {
      const testEmail = `login-test-${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash("Login123!", 10);

      await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          name: "Login Test User",
          role: "BRAND",
        },
      });

      testUserEmail = testEmail;
    });

    it("should login with valid credentials", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUserEmail,
          password: "Login123!",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      testUserToken = response.body.token;
    });

    it("should reject invalid password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUserEmail,
          password: "WrongPassword123!",
        })
        .expect(401);
    });

    it("should reject non-existent user", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "Password123!",
        })
        .expect(401);
    });

    it("should access protected route with valid token", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/me")
        .set("Authorization", `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUserEmail);
    });

    it("should reject request without token", async () => {
      await request(app.getHttpServer()).post("/auth/me").expect(401);
    });
  });

  describe("GET /influencers/league", () => {
    it("should return influencer league", async () => {
      const response = await request(app.getHttpServer())
        .get("/influencers/league")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should accept limit parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/influencers/league?limit=10")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe("GET /campaigns", () => {
    it("should return campaigns list", async () => {
      const response = await request(app.getHttpServer())
        .get("/campaigns")
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("Admin Endpoints", () => {
    it("should return dashboard stats for admin", async () => {
      const response = await request(app.getHttpServer())
        .get("/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("stats");
    });

    it("should reject non-admin access to admin routes", async () => {
      // Create a non-admin user
      const testEmail = `nonadmin-${Date.now()}@test.com`;
      const hashedPassword = await bcrypt.hash("Password123!", 10);

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          name: "Non Admin",
          role: "BRAND",
        },
      });

      const userToken = jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      await request(app.getHttpServer())
        .get("/admin/dashboard")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
