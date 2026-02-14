# 👨‍💻 Developer Guide - SMM League

## 🎯 Project Overview

**SMM League** is a production-ready influencer marketing platform built with:

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + React + TailwindCSS
- **Infrastructure**: Docker + GitHub Actions

## 🏗️ Architecture Overview

### Monorepo Structure

```
smm-league/
├── apps/
│   ├── backend/    (NestJS API)
│   └── frontend/   (Next.js App)
├── packages/       (Shared utilities - ready for expansion)
├── .github/        (CI/CD workflows)
└── docs/          (Documentation)
```

### Technology Stack

**Backend**

- NestJS 10 (Node.js framework)
- Prisma 5 (ORM)
- PostgreSQL 15 (Database)
- JWT (Authentication)
- Passport.js (Auth strategy)
- bcrypt (Password hashing)

**Frontend**

- Next.js 14 (React framework)
- React 18 (UI library)
- TailwindCSS 3 (Styling)
- Zustand (State management)
- Axios (HTTP client)

**DevOps**

- Docker (Containerization)
- Docker Compose (Orchestration)
- GitHub Actions (CI/CD)
- Turbo (Monorepo management)

---

## 📚 Module Overview

### Backend Modules

#### 1. Auth Module (`src/modules/auth/`)

**Responsibility**: User authentication and authorization

**Files**:

- `auth.service.ts` - Login, register, token validation
- `auth.controller.ts` - Auth endpoints
- `auth.module.ts` - Module configuration

**Key Methods**:

```typescript
register(email, password, name, role); // Create new user
login(user); // Generate JWT token
validateUser(email, password); // Validate credentials
```

**Endpoints**:

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `POST /auth/me` - Get current user (requires JWT)

---

#### 2. Influencers Module (`src/modules/influencers/`)

**Responsibility**: Influencer discovery, league, and profile management

**Files**:

- `influencers.service.ts` - Business logic
- `influencers.controller.ts` - API endpoints
- `influencers.module.ts` - Module setup

**Key Methods**:

```typescript
getLeague(limit)                           // Get ranked influencers
getInfluencerById(id)                     // Get single profile
searchInfluencers(category, platform)     // Search with filters
updateRankings(rankings)                  // Admin: manually reorder
addSocialAccount(influencerId, ...)       // Link social media
```

**Endpoints**:

- `GET /influencers/league` - Get league
- `GET /influencers/search` - Search
- `GET /influencers/:id` - Get details
- `PUT /admin/influencers/rankings/update` - Admin only

---

#### 3. Campaigns Module (`src/modules/campaigns/`)

**Responsibility**: Campaign creation, bidding, and selection

**Files**:

- `campaigns.service.ts` - Campaign logic
- `campaigns.controller.ts` - Endpoints
- `campaigns.module.ts` - Setup

**Key Methods**:

```typescript
createCampaign(...)                        // Brand creates campaign
getCampaigns(brandId?, status?)           // List campaigns
submitBid(campaignId, influencerId, ...)  // Influencer bids
acceptBid(bidId)                          // Brand accepts → Deal
rejectBid(bidId)                          // Brand rejects
```

**Endpoints**:

- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create (brand only)
- `GET /campaigns/:id` - Get details
- `POST /campaigns/:id/bids` - Submit bid (influencer)
- `POST /campaigns/bids/:bidId/accept` - Accept (brand)
- `POST /campaigns/bids/:bidId/reject` - Reject (brand)

---

#### 4. Deals Module (`src/modules/deals/`)

**Responsibility**: Deal lifecycle management

**Files**:

- `deals.service.ts` - Deal operations
- `deals.controller.ts` - API
- `deals.module.ts` - Setup

**Key Methods**:

```typescript
getDeals(userId?, status?)                // Get user's deals
getDealById(id)                           // Get single deal
updateDealStatus(id, status)              // Change status
submitContent(id, contentUrl)             // Influencer submits
approveDeal(id)                           // Brand approves
completeDeal(id)                          // Mark done
```

**Endpoints**:

- `GET /deals` - Get user's deals
- `GET /deals/:id` - Get details
- `PUT /deals/:id/status` - Update status
- `POST /deals/:id/content` - Submit content
- `POST /deals/:id/approve` - Approve content
- `POST /deals/:id/complete` - Complete deal

---

#### 5. Chat Module (`src/modules/chat/`)

**Responsibility**: Real-time messaging between deal parties

**Files**:

- `chat.service.ts` - Message operations
- `chat.controller.ts` - Endpoints
- `chat.module.ts` - Setup

**Key Methods**:

```typescript
getMessages(dealId); // Fetch messages
sendMessage(dealId, senderId, content); // Send message
```

**Endpoints**:

- `GET /chat/:dealId/messages` - Get messages
- `POST /chat/:dealId/messages` - Send message

---

#### 6. Admin Module (`src/modules/admin/`)

**Responsibility**: System-wide control (God Mode)

**Files**:

- `admin.service.ts` - Admin operations
- `admin.controller.ts` - Admin endpoints
- `admin.module.ts` - Setup

**Key Features**:

```typescript
// User Management
getAllUsers()                              // View all
createUser(...)                            // Create any user
updateUser(id, data)                       // Edit any user
deleteUser(id)                             // Delete any user
switchUserRole(userId, newRole)            // Change role

// Influencer Management
getAllInfluencers()                        // List all
createInfluencer(...)                      // Create profile
updateRankings(rankings)                   // Reorder league
deleteInfluencer(id)                       // Remove

// Deal Control
getAllDeals()                              // List all deals
forceCompleteDeal(id)                      // Force completion

// Subscription Control
activateSubscription(...)                  // Give subscription
deactivateSubscription(userId)             // Remove

// Payment Tracking
getAllPayments()                           // View payments
createPayment(...)                         // Record payment

// Audit Logging
getAuditLogs(limit)                       // View actions
impersonateUser(userId)                    // Login as user
logAction(...)                             // Log admin action
```

**Endpoints** (all require admin role):

- `GET /admin/dashboard` - Overview
- `GET /admin/users` - All users
- `POST /admin/users` - Create user
- `GET /admin/influencers` - All influencers
- `GET /admin/campaigns` - All campaigns
- `GET /admin/deals` - All deals
- `GET /admin/subscriptions` - All subscriptions
- `GET /admin/payments` - All payments
- `GET /admin/audit-logs` - Action logs
- `POST /admin/impersonate/:userId` - Impersonate user

---

## 🖥️ Frontend Pages Structure

### Authentication Pages

```
/auth/
├── login/       - User login
└── register/    - Sign up (role selection + info)
```

### Brand Pages

```
/brand/
├── dashboard/   - Overview + stats
├── league/      - Browse influencers
├── campaigns/   - Manage campaigns
├── deals/       - Track deals
└── subscription/- Manage subscription
```

### Influencer Pages

```
/influencer/
├── dashboard/   - Stats + quick actions
├── league/      - Global ranking
├── campaigns/   - Browse + bid
├── deals/       - Manage deals
├── bids/        - Bid history
├── profile/     - Edit profile
└── chat/:dealId/- Message UI
```

### Admin Pages

```
/admin/
├── dashboard/   - Overview + audit log
├── users/       - User management
├── bloggers/    - Influencer management
├── campaigns/   - Campaign CRUD
├── deals/       - Deal control
├── subscriptions/- Subscription management
├── payments/    - Payment records
└── audit-logs/  - Complete action history
```

---

## 🗄️ Database Schema

### Core Entities

**User**

```typescript
{
  id: string                    // Primary key
  email: string                 // Unique
  password: string              // Hashed
  name: string
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN'
  avatar?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**BrandProfile**

```typescript
{
  id: string
  userId: string (FK → User)
  companyName: string
  website?: string
  description?: string
  logo?: string
  budget?: number
}
```

**InfluencerProfile**

```typescript
{
  id: string
  userId: string (FK → User)
  category: string              // Fashion, Tech, Travel, etc.
  bio?: string
  rating: number               // 0-5
  rank?: number                // League position
  socialAccounts: SocialAccount[]
}
```

**SocialAccount**

```typescript
{
  id: string
  influencerId: string (FK → InfluencerProfile)
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'TELEGRAM' | 'TWITTER'
  username: string
  followers: number
  engagement: number            // %
  url: string
  syncedAt: DateTime
}
```

**Campaign**

```typescript
{
  id: string
  brandId: string (FK → User)
  title: string
  description: string
  budget: number
  platform: string              // instagram, youtube, tiktok
  deadline: DateTime
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  requirements?: string
  bids: Bid[]
  deals: Deal[]
}
```

**Bid**

```typescript
{
  id: string
  campaignId: string (FK → Campaign)
  influencerId: string (FK → InfluencerProfile)
  price: number
  proposal: string
  deliveryTime: DateTime
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
}
```

**Deal**

```typescript
{
  id: string
  campaignId: string (FK → Campaign)
  brandId: string (FK → User)
  influencerId: string (FK → InfluencerProfile)
  price: number
  status: 'ACTIVE' | 'CONTENT_SUBMITTED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'
  contentUrl?: string           // Influencer submits here
  approvedAt?: DateTime
  completedAt?: DateTime
  messages: Message[]
}
```

**Message**

```typescript
{
  id: string
  dealId: string (FK → Deal)
  senderId: string (FK → User)
  content: string
  createdAt: DateTime
}
```

**Subscription**

```typescript
{
  id: string
  userId: string (FK → User)
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  tier: string                  // basic, pro, enterprise
  startDate: DateTime
  endDate: DateTime
}
```

**Payment**

```typescript
{
  id: string
  userId: string (FK → User)
  amount: number
  currency: string              // USD default
  status: string                // completed, pending, failed
  type: string                  // subscription, campaign_fee
  referenceId?: string
}
```

**AdminAction**

```typescript
{
  id: string
  adminId: string (FK → User)
  action: string                // CREATE_USER, UPDATE_CAMPAIGN, etc.
  targetId?: string
  targetType?: string
  details?: string              // JSON serialized
  createdAt: DateTime
}
```

---

## 🔐 Authentication Flow

### Login Flow

```
1. User submits email + password
2. ValidateUser(email, password)
   - Find user by email
   - Compare password with bcrypt
   - Return user if valid
3. Generate JWT token with user payload
4. Return token + user to frontend
5. Frontend stores token in localStorage
6. Include token in Authorization header for future requests
```

### Request Authentication

```
1. Frontend includes: Authorization: Bearer <token>
2. Passport JWT strategy validates token
3. JwtAuthGuard checks if token is valid
4. Request.user is populated with decoded token
5. Endpoint executes with user context
```

### Role-Based Access

```
1. JwtAuthGuard validates JWT
2. AdminGuard checks if user.role === 'ADMIN'
3. If not admin, throw ForbiddenException
4. Only admins can access /admin/* endpoints
```

---

## 🔄 Feature Workflows

### Campaign → Bid → Deal → Completion

**Step 1: Brand Creates Campaign**

```
POST /campaigns
{
  title: "Summer Collection Launch",
  description: "...",
  budget: 50000,
  platform: "INSTAGRAM",
  deadline: "2026-03-31"
}
```

**Step 2: Influencer Submits Bid**

```
POST /campaigns/:campaignId/bids
{
  price: 5000,
  proposal: "I'll create 5 Instagram posts...",
  deliveryTime: "2026-03-25"
}
```

**Step 3: Brand Reviews Bids**

```
GET /campaigns/:campaignId
// Returns campaign with all bids
```

**Step 4: Brand Accepts Bid**

```
POST /campaigns/bids/:bidId/accept
// Creates Deal automatically
```

**Step 5: Influencer Submits Content**

```
POST /deals/:dealId/content
{
  contentUrl: "https://instagram.com/p/ABC123..."
}
// Changes deal status to CONTENT_SUBMITTED
```

**Step 6: Brand Approves**

```
POST /deals/:dealId/approve
// Changes status to APPROVED
```

**Step 7: Complete Deal**

```
POST /deals/:dealId/complete
// Changes status to COMPLETED
```

---

## 🧪 Testing the Platform

### Test Data

**Admin Account**

```
Email: admin@example.com
Password: Admin123!
Role: Admin
```

**Brand Account**

```
Email: brand1@example.com
Password: Brand123!
Role: Brand
Company: Nike Campaigns
```

**Influencer Account**

```
Email: influencer1@example.com
Password: Influencer123!
Role: Influencer
Rank: #1
Followers: 500,000
```

### API Testing with cURL

**Login**

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'
```

**Get League**

```bash
curl http://localhost:3001/influencers/league
```

**Get Admin Dashboard** (requires token)

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/admin/dashboard
```

---

## 🚀 Development Workflow

### Setup

```bash
# 1. Clone and install
cd smm-league
npm install

# 2. Setup database
cd apps/backend
npx prisma migrate dev

# 3. Generate client
npx prisma generate

# 4. Seed test data (optional)
npx prisma db seed
```

### Running Services

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Frontend
cd apps/frontend
npm run dev
# Runs on http://localhost:3000

# Terminal 3: Database UI (optional)
cd apps/backend
npx prisma studio
# Opens on http://localhost:5555
```

### Making Changes

**Adding an API Endpoint**

```typescript
// 1. Update service (campaigns.service.ts)
async getStats() {
  return this.prisma.campaign.groupBy({
    by: ['status'],
    _count: true
  });
}

// 2. Add controller method
@Get('stats')
async getStats() {
  return this.campaignsService.getStats();
}

// 3. Test endpoint
curl http://localhost:3001/campaigns/stats
```

**Adding a Frontend Page**

```typescript
// 1. Create page component
// apps/frontend/src/app/brand/new-page/page.tsx
export default function NewPage() {
  return <div>Content here</div>;
}

// 2. Navigation automatically works
// Page accessible at http://localhost:3000/brand/new-page

// 3. Add to navigation menu
// Update header component with new link
```

**Adding Database Field**

```typescript
// 1. Update schema (prisma/schema.prisma)
model User {
  // ... existing fields
  newField String  // Add field
}

// 2. Create migration
npx prisma migrate dev --name add_new_field

// 3. Regenerate client
npx prisma generate

// 4. Use in code
const user = await this.prisma.user.findUnique({
  where: { id: 'xxx' }
});
console.log(user.newField);
```

---

## 🐛 Debugging

### Backend Debugging

```bash
# Enable verbose logging
npm run dev -- --debug

# Use Prisma Studio
npx prisma studio

# Check database directly
psql $DATABASE_URL -c "SELECT * FROM \"User\";"
```

### Frontend Debugging

- Open DevTools (F12)
- Check Network tab for API calls
- Check Console for errors
- Check Application → localStorage for token

### Common Issues

**API 404**

```
Check:
1. Is backend running on :3001?
2. Is endpoint spelled correctly?
3. Does route exist in controller?
4. Is middleware applied correctly?
```

**Database Connection Refused**

```
Check:
1. Is PostgreSQL running?
2. Is DATABASE_URL correct?
3. Are credentials correct?
4. Is database created?
```

**Token Expired**

```
Check:
1. Is token still valid?
2. Token expires in 7 days
3. Re-login to get new token
4. Check JWT_SECRET is consistent
```

---

## 📦 Building for Production

```bash
# 1. Build backend
cd apps/backend
npm run build
# Creates dist/ folder

# 2. Build frontend
cd apps/frontend
npm run build
# Creates .next/ folder

# 3. Build Docker images
docker-compose build

# 4. Test images locally
docker-compose up -d
```

---

## 🔄 Contributing

1. **Create feature branch**: `git checkout -b feature/name`
2. **Make changes**: Follow module structure
3. **Test locally**: Ensure no errors
4. **Commit**: `git commit -m "feat: description"`
5. **Push**: `git push origin feature/name`
6. **Create PR**: GitHub automatically runs CI

CI/CD checks:

- ✅ Build passes
- ✅ Tests pass
- ✅ Lint passes
- ✅ No security issues

---

## 📚 Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

## ✨ Best Practices

1. **Keep modules focused** - Single responsibility
2. **Use TypeScript** - Catch errors early
3. **Validate input** - Use class-validator
4. **Handle errors** - Don't let them bubble
5. **Use transactions** - For multi-step operations
6. **Index database** - On frequently queried fields
7. **Cache responses** - For expensive queries
8. **Log actions** - Admin actions especially
9. **Test thoroughly** - Before pushing
10. **Document code** - Comments on complex logic

---

**Happy coding! 🚀**
