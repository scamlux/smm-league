-- Seed script for development data
-- Run with: psql -U user -d smm_league -f apps/backend/prisma/seed.sql

-- Create test users
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") VALUES
('admin-1', 'admin@example.com', '$2b$10$test', 'Admin User', 'ADMIN', NOW(), NOW()),
('brand-1', 'brand1@example.com', '$2b$10$test', 'Nike Campaigns', 'BRAND', NOW(), NOW()),
('brand-2', 'brand2@example.com', '$2b$10$test', 'Adidas Marketing', 'BRAND', NOW(), NOW()),
('influencer-1', 'influencer1@example.com', '$2b$10$test', 'Emma Fashion', 'INFLUENCER', NOW(), NOW()),
('influencer-2', 'influencer2@example.com', '$2b$10$test', 'Tech Guru Mike', 'INFLUENCER', NOW(), NOW()),
('influencer-3', 'influencer3@example.com', '$2b$10$test', 'Travel Luna', 'INFLUENCER', NOW(), NOW());

-- Create brand profiles
INSERT INTO "BrandProfile" (id, "userId", "companyName", website, description, budget, "createdAt", "updatedAt") VALUES
('bp-1', 'brand-1', 'Nike', 'https://nike.com', 'Global sports brand', 100000, NOW(), NOW()),
('bp-2', 'brand-2', 'Adidas', 'https://adidas.com', 'International sportswear company', 80000, NOW(), NOW());

-- Create influencer profiles
INSERT INTO "InfluencerProfile" (id, "userId", category, bio, rating, rank, "createdAt", "updatedAt") VALUES
('ip-1', 'influencer-1', 'Fashion', 'Fashion blogger with 500k followers', 4.8, 1, NOW(), NOW()),
('ip-2', 'influencer-2', 'Tech', 'Tech reviewer and YouTube creator', 4.6, 2, NOW(), NOW()),
('ip-3', 'influencer-3', 'Travel', 'Travel vlogger exploring the world', 4.4, 3, NOW(), NOW());

-- Create social accounts
INSERT INTO "SocialAccount" (id, "influencerId", platform, username, followers, engagement, url, "syncedAt", "createdAt", "updatedAt") VALUES
('sa-1', 'ip-1', 'INSTAGRAM', 'emmafashion', 500000, 8.5, 'https://instagram.com/emmafashion', NOW(), NOW(), NOW()),
('sa-2', 'ip-2', 'YOUTUBE', 'TechGuruMike', 750000, 6.2, 'https://youtube.com/c/TechGuruMike', NOW(), NOW(), NOW()),
('sa-3', 'ip-3', 'TIKTOK', 'travelluna', 1200000, 9.1, 'https://tiktok.com/@travelluna', NOW(), NOW(), NOW());

-- Create campaigns
INSERT INTO "Campaign" (id, "brandId", title, description, budget, platform, deadline, status, requirements, "createdAt", "updatedAt") VALUES
('c-1', 'brand-1', 'Summer Collection Launch', 'Launch new summer collection on Instagram', 50000, 'INSTAGRAM', '2026-03-31', 'OPEN', 'Minimum 100k followers, 5% engagement', NOW(), NOW()),
('c-2', 'brand-2', 'Fitness Challenge', 'Promote new fitness line', 30000, 'TIKTOK', '2026-04-15', 'OPEN', 'Must have fitness audience', NOW(), NOW());

-- Create subscriptions
INSERT INTO "Subscription" (id, "userId", status, tier, "startDate", "endDate", "createdAt", "updatedAt") VALUES
('sub-1', 'brand-1', 'ACTIVE', 'pro', NOW(), '2026-04-28', NOW(), NOW()),
('sub-2', 'brand-2', 'ACTIVE', 'basic', NOW(), '2026-02-28', NOW(), NOW());

-- Create payments (mock)
INSERT INTO "Payment" (id, "userId", amount, currency, status, type, "createdAt", "updatedAt") VALUES
('p-1', 'brand-1', 299.99, 'USD', 'completed', 'subscription', NOW(), NOW()),
('p-2', 'brand-2', 99.99, 'USD', 'completed', 'subscription', NOW(), NOW());
