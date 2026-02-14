import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await bcrypt.hash("Admin123!", 10),
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("✅ Created admin:", adminUser.email);

  // Create Brand Users
  const brand1User = await prisma.user.create({
    data: {
      email: "brand1@example.com",
      password: await bcrypt.hash("Brand123!", 10),
      name: "Nike Marketing",
      role: "BRAND",
    },
  });

  const brand1Profile = await prisma.brandProfile.create({
    data: {
      userId: brand1User.id,
      companyName: "Nike Campaigns",
      website: "https://nike.com",
      description: "Leading sports brand marketing campaigns",
      budget: 50000,
    },
  });
  console.log("✅ Created brand 1: Nike");

  const brand2User = await prisma.user.create({
    data: {
      email: "brand2@example.com",
      password: await bcrypt.hash("Brand123!", 10),
      name: "Adidas Marketing",
      role: "BRAND",
    },
  });

  const brand2Profile = await prisma.brandProfile.create({
    data: {
      userId: brand2User.id,
      companyName: "Adidas Marketing",
      website: "https://adidas.com",
      description: "Premium sportswear marketing",
      budget: 75000,
    },
  });
  console.log("✅ Created brand 2: Adidas");

  // Create Influencer Users
  const influencer1User = await prisma.user.create({
    data: {
      email: "influencer1@example.com",
      password: await bcrypt.hash("Influencer123!", 10),
      name: "Emma Fashion",
      role: "INFLUENCER",
    },
  });

  const influencer1 = await prisma.influencerProfile.create({
    data: {
      userId: influencer1User.id,
      category: "Fashion",
      bio: "Fashion blogger and lifestyle influencer",
      rating: 4.8,
      rank: 1,
      socialAccounts: {
        create: {
          platform: "INSTAGRAM",
          username: "emma_fashion",
          followers: 500000,
          engagement: 8.5,
          url: "https://instagram.com/emma_fashion",
        },
      },
    },
  });
  console.log("✅ Created influencer 1: Emma Fashion");

  const influencer2User = await prisma.user.create({
    data: {
      email: "influencer2@example.com",
      password: await bcrypt.hash("Influencer123!", 10),
      name: "Tech Guru Mike",
      role: "INFLUENCER",
    },
  });

  const influencer2 = await prisma.influencerProfile.create({
    data: {
      userId: influencer2User.id,
      category: "Technology",
      bio: "Tech review and gadget channel",
      rating: 4.7,
      rank: 2,
      socialAccounts: {
        create: {
          platform: "YOUTUBE",
          username: "techguruMike",
          followers: 750000,
          engagement: 7.2,
          url: "https://youtube.com/techguruMike",
        },
      },
    },
  });
  console.log("✅ Created influencer 2: Tech Guru Mike");

  const influencer3User = await prisma.user.create({
    data: {
      email: "influencer3@example.com",
      password: await bcrypt.hash("Influencer123!", 10),
      name: "Travel Luna",
      role: "INFLUENCER",
    },
  });

  const influencer3 = await prisma.influencerProfile.create({
    data: {
      userId: influencer3User.id,
      category: "Travel",
      bio: "Travel vlogger exploring the world",
      rating: 4.6,
      rank: 3,
      socialAccounts: {
        create: {
          platform: "TIKTOK",
          username: "travel_luna",
          followers: 1200000,
          engagement: 9.1,
          url: "https://tiktok.com/@travel_luna",
        },
      },
    },
  });
  console.log("✅ Created influencer 3: Travel Luna");

  // Create subscriptions for brands
  await prisma.subscription.create({
    data: {
      userId: brand1User.id,
      tier: "pro",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  await prisma.subscription.create({
    data: {
      userId: brand2User.id,
      tier: "basic",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log("✅ Created subscriptions");

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      title: "Summer Collection Launch",
      description: "Launch campaign for our new summer collection",
      budget: 25000,
      platform: "instagram",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "OPEN",
      requirements: "Minimum 100k followers, engagement rate 5%+",
      brandId: brand1Profile.id,
    },
  });

  console.log("✅ Created sample campaign:", campaign.title);

  // Create sample bid
  const bid = await prisma.bid.create({
    data: {
      campaignId: campaign.id,
      userId: influencer1User.id,
      influencerId: influencer1.id,
      price: 5000,
      proposal: "I can create amazing summer content for your brand",
      deliveryTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    },
  });

  console.log("✅ Created sample bid");

  console.log("✨ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
