// Global test setup
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Increase Jest timeout for integration tests
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test data
export const testUsers = {
  admin: {
    email: "admin@test.com",
    password: "Admin123!",
    role: "ADMIN",
    name: "Test Admin",
  },
  brand: {
    email: "brand@test.com",
    password: "Brand123!",
    role: "BRAND",
    name: "Test Brand",
  },
  influencer: {
    email: "influencer@test.com",
    password: "Influencer123!",
    role: "INFLUENCER",
    name: "Test Influencer",
  },
};

// Helper to create test data
export async function createTestUser(userData: typeof testUsers.brand) {
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role as any,
    },
  });
}

// Helper to clean up test data
export async function cleanupTestUser(email: string) {
  await prisma.user.deleteMany({
    where: { email: { contains: "@test.com" } },
  });
}
