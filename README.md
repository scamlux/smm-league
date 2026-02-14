# SMM League - Influencer Marketing Platform

A production-ready, full-scale influencer marketing platform combining blogger discovery, campaigns, subscriptions, and real-time chat.

## 🚀 Features

### Core Features

- **SMM League**: Ranked list of influencers with public and subscription-locked data
- **Campaign Management**: Brands create advertising campaigns, influencers submit bids
- **Deal Lifecycle**: From bid acceptance to content approval and completion
- **Real-time Chat**: Direct communication between brands and influencers per deal
- **Admin God Mode**: Complete system control with audit logging
- **Role-Based Access**: Brand, Influencer, and Admin roles with RBAC

### Technical Highlights

- **Full Stack**: Next.js + NestJS + PostgreSQL + Prisma
- **Database**: Persistent storage with 14 core entities and relationships
- **Authentication**: JWT-based auth with role-based access control
- **CI/CD**: GitHub Actions pipeline with Docker image building
- **Scalable**: Dockerized services ready for production deployment

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│         http://localhost:3000                        │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────┐
│                    Backend (NestJS)                  │
│         http://localhost:3001                        │
└────────────────┬────────────────────────────────────┘
                 │ SQL
┌────────────────▼────────────────────────────────────┐
│         Database (PostgreSQL)                        │
│      localhost:5432/smm_league                │
└─────────────────────────────────────────────────────┘
```

## 🗄️ Database Schema

### Core Entities

- **User**: Authentication and base user data
- **BrandProfile**: Company/brand information
- **InfluencerProfile**: Blogger data with ranking
- **SocialAccount**: Links to Instagram, YouTube, TikTok, Telegram, Twitter
- **Campaign**: Advertising campaigns by brands
- **Bid**: Influencer bids on campaigns
- **Deal**: Accepted bids become deals with lifecycle tracking
- **Message**: Chat messages per deal
- **Subscription**: Brand subscriptions to unlock features
- **Payment**: Payment records (mock)
- **AdminAction**: Audit logs for admin operations

## 🔧 Tech Stack

### Frontend

- Next.js 14 (React, Server Components)
- TailwindCSS (utility-first styling)
- Zustand (state management)
- Axios (HTTP client)
- Lucide React (icons)

### Backend

- NestJS 10 (Node.js framework)
- Prisma (ORM)
- JWT (authentication)
- Passport (auth strategy)
- bcrypt (password hashing)

### Database & Infrastructure

- PostgreSQL 15
- Docker & Docker Compose
- GitHub Actions (CI/CD)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional)
- PostgreSQL 15 (or use Docker)

### Local Development

1. **Clone and setup**:

```bash
cd smm-league
npm install
```

2. **Configure environment**:

```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

3. **Setup database**:

```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
```

4. **Start services**:

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

Visit http://localhost:3000

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

All services start automatically:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432

## 📖 API Endpoints

### Auth

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/me` - Get current user profile

### Influencers

- `GET /influencers/league` - Get ranked influencer list
- `GET /influencers/search` - Search influencers by category/platform
- `GET /influencers/:id` - Get influencer details
- `PUT /admin/influencers/rankings/update` - Update rankings (admin only)

### Campaigns

- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign (brand only)
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns/:id/bids` - Submit bid (influencer only)
- `POST /campaigns/bids/:bidId/accept` - Accept bid (brand only)

### Deals

- `GET /deals` - List user's deals
- `POST /deals/:id/content` - Submit content (influencer)
- `POST /deals/:id/approve` - Approve content (brand)
- `POST /deals/:id/complete` - Complete deal

### Chat

- `GET /chat/:dealId/messages` - Get messages
- `POST /chat/:dealId/messages` - Send message

### Admin

- `GET /admin/dashboard` - Admin overview
- `GET /admin/users` - All users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id/role` - Change user role
- `PUT /admin/influencers/rankings/update` - Update rankings
- `POST /admin/subscriptions` - Activate subscription
- `GET /admin/audit-logs` - View audit logs
- `POST /admin/impersonate/:userId` - Impersonate user

## 👥 User Roles

### Brand (Business)

- View league with filters
- Create campaigns
- Review and accept bids
- Manage deals and chat
- Subscribe to unlock contacts and prices
- View campaign analytics

### Influencer (Blogger)

- View league ranking
- Complete profile with social accounts
- Browse and bid on campaigns
- Manage deals
- Submit content for approval
- Track earnings

### Admin

- **God Mode**: Full system control
- Manage all users (CRUD + role switch)
- Create/edit/delete influencers
- Manually update rankings
- Create/manage campaigns and deals
- Activate/deactivate subscriptions
- View all payments
- **Audit logging**: Track all admin actions
- Impersonate users for testing

## 🔐 Authentication & Authorization

- JWT tokens with 7-day expiration
- Role-based access control (RBAC)
- Middleware enforces permissions
- Admin guard for protected endpoints
- Secure password hashing with bcrypt

## 📊 League & Ranking System

- Influencers ranked by: engagement, followers, rating
- Admins can manually reorder rankings
- Free tier: see public stats only
- Subscribed tier: unlock contact info, advertising prices, discounts
- Locked content visualized with blur + lock icon

## 💳 Subscription Model

- **Tiers**: Basic, Pro, Enterprise (mock)
- **Features Unlocked**:
  - Contact information for influencers
  - Advertising pricing and discounts
  - Direct messaging priority
  - Campaign analytics
- **Admin Control**: Activate/deactivate subscriptions
- **Payment Tracking**: Mock payment records in database

## 🎬 Campaign & Deal Flow

1. **Brand creates campaign** → Sets budget, platform, deadline, requirements
2. **Influencers submit bids** → Price quote + proposal + delivery time
3. **Brand accepts bid** → Deal created automatically
4. **Influencer submits content** → Content URL + status change
5. **Brand approves content** → Final approval
6. **Deal completed** → Both parties see completion status

## 🛠️ CI/CD Pipeline

### Automated On Every Push

1. **Build** - Compile backend and frontend
2. **Test** - Run test suites
3. **Lint** - Code quality checks
4. **Security** - Trivy vulnerability scanning

### On Successful Build (main branch)

1. **Docker Images** - Build and push to GitHub Container Registry
2. **Versioning** - Semantic versioning tags
3. **Auto-Deploy** - Ready for container orchestration

### GitHub Actions Workflow

- File: `.github/workflows/ci-cd.yml`
- Runs on: push to main/develop, pull requests
- Produces: Docker images tagged with commit SHA, branch, version

## 📁 Project Structure

```
smm-league/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── influencers/
│   │   │   │   ├── campaigns/
│   │   │   │   ├── deals/
│   │   │   │   ├── chat/
│   │   │   │   └── admin/
│   │   │   └── common/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── Dockerfile
│   └── frontend/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
├── package.json
└── README.md
```

## 📝 Environment Variables

See `.env.example`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/smm_league
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## 🧪 Testing

```bash
# Backend tests
cd apps/backend
npm run test

# Frontend tests
cd apps/frontend
npm run test
```

## 📦 Building for Production

```bash
# Build all
npm run build

# Or individually
cd apps/backend && npm run build
cd apps/frontend && npm run build

# Build Docker images
docker-compose -f docker-compose.yml build
```

## 🚨 Security

- JWT authentication with secret key
- Password hashing with bcrypt (10 rounds)
- CORS protection
- Input validation with class-validator
- Admin audit logging for all actions
- SQL injection protection via Prisma ORM
- Secure HTTP headers recommended for production

## 🎯 Demo Credentials

After running Prisma migrations, admins can create test users:

```bash
# Create via admin API
POST /admin/users
{
  "email": "admin@example.com",
  "password": "AdminPass123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

## 📈 Next Steps

1. **Enhanced Search**: Full-text search on influencers/campaigns
2. **Real-time Updates**: WebSockets for live notifications
3. **Payment Gateway**: Stripe/PayPal integration
4. **Analytics Dashboard**: Campaign ROI tracking
5. **API Rate Limiting**: Prevent abuse
6. **Recommendation Engine**: AI-powered influencer matching

## 📄 License

MIT

## 👨‍💻 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**SMM League** - Connecting Brands with Influencers. 🚀
