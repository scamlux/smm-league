# SMM League - Quick Start

## 🚀 Requirements

- Node.js v18+
- npm v9+
- Docker 24.0+ (or local PostgreSQL 15+)

## ⚡ Quick Setup (5 minutes)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL (Docker)

```bash
docker run --name smm-league-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smm_league \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 3. Setup database

```bash
cd apps/backend
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 4. Start dev servers

**Terminal 1 - Backend (port 3001):**

```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend (port 3000):**

```bash
cd apps/frontend
npm run dev
```

### 5. Access the app

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:3001**
- Database UI: `npx prisma studio` (in backend directory)

---

## 👥 Test Accounts

| Role         | Email                   | Password       |
| ------------ | ----------------------- | -------------- |
| Admin        | admin@example.com       | Admin123!      |
| Brand 1      | brand1@example.com      | Brand123!      |
| Brand 2      | brand2@example.com      | Brand123!      |
| Influencer 1 | influencer1@example.com | Influencer123! |
| Influencer 2 | influencer2@example.com | Influencer123! |
| Influencer 3 | influencer3@example.com | Influencer123! |

---

## 📝 Key Commands

### Backend

```bash
cd apps/backend
npm run dev              # Start dev server
npm run build            # Build for production
npx prisma studio       # View/edit database
npx prisma db seed      # Add test data
npx prisma migrate reset # Reset database
```

### Frontend

```bash
cd apps/frontend
npm run dev              # Start dev server
npm run build            # Build for production
```

---

## 🆘 Troubleshooting

**Port already in use?**

```bash
# Kill process on port (replace XXXX with port number)
lsof -i :XXXX | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Reset everything?**

```bash
cd apps/backend
npx prisma migrate reset
```

---

**Happy coding! 🚀**
