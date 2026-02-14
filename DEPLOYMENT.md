# Deployment Guide for SMM League

This guide covers deploying the SMM League platform to production.

## Deployment Options

### 1. Docker Compose (Single Server)

**Best for**: Small to medium deployments, development environments

```bash
# On your server
git clone <repository>
cd smm-league

# Create production environment file
cat > .env.prod << EOF
DATABASE_URL=postgresql://prod_user:strong_password@postgres:5432/smm_league_prod
BACKEND_URL=https://api.smm-league.lovable.app
FRONTEND_URL=https://smm-league.lovable.app
JWT_SECRET=your-very-long-random-secret-key-here
NODE_ENV=production
EOF

# Build and start
docker-compose -f docker-compose.yml up -d

# Setup database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### 2. Kubernetes Deployment

**Best for**: Large scale, high availability

Create `k8s/` directory with:

- `postgres-deployment.yaml`
- `backend-deployment.yaml`
- `frontend-deployment.yaml`
- `ingress.yaml`

```bash
kubectl apply -f k8s/
```

### 3. Cloud Platforms

#### AWS (ECS/Fargate)

- Push images to ECR
- Deploy using ECS task definitions
- Use RDS for PostgreSQL
- Use CloudFront for CDN

#### Google Cloud (Cloud Run)

- Push images to Cloud Artifact Registry
- Deploy services to Cloud Run
- Use Cloud SQL for PostgreSQL
- Use Cloud CDN

#### DigitalOcean (App Platform)

- Connect GitHub repository
- Configure build settings
- Deploy automatically on push

---

## Pre-Deployment Checklist

- [ ] Update `JWT_SECRET` with strong random key
- [ ] Configure proper database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Setup database backups
- [ ] Configure logging and monitoring
- [ ] Test CI/CD pipeline
- [ ] Load test the application
- [ ] Setup monitoring/alerting
- [ ] Document deployment process
- [ ] Create rollback plan

---

## Production Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@db-host:5432/smm_league_prod
JWT_SECRET=<very-long-random-secure-string>
NODE_ENV=production

# API & Frontend
BACKEND_URL=https://api.smm-league.lovable.app
FRONTEND_URL=https://smm-league.lovable.app

# Optional
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn
```

---

## Monitoring & Logs

### Application Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Monitoring

```bash
docker-compose exec postgres pg_stat_statements
```

### Health Checks

```bash
curl https://api.smm-league.lovable.app/health
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U user smm_league_prod > backup.sql

# Restore
docker-compose exec -T postgres psql -U user smm_league_prod < backup.sql
```

### Auto Backups

Configure in `docker-compose.yml`:

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /backups/postgres
```

---

## Scaling Strategies

### Horizontal Scaling

- Multiple backend instances behind load balancer
- Separate database server
- Redis for session caching
- CDN for static files

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Enable caching

---

## Security Hardening

1. **SSL/TLS**

   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d smm-league.lovable.app
   ```

2. **Environment Variables**
   - Never commit `.env` files
   - Use secret management (Vault, AWS Secrets Manager)

3. **Database**
   - Strong passwords
   - Network isolation
   - Regular backups
   - Encryption at rest

4. **API Security**
   - Rate limiting
   - Input validation
   - CORS configuration
   - HTTPS only

5. **Infrastructure**
   - Firewall rules
   - SSH key authentication
   - Regular security updates
   - Monitoring/alerts

---

## Performance Optimization

### Frontend

- Enable Gzip compression
- CDN for static assets
- Code splitting
- Caching headers

### Backend

- Database query optimization
- Connection pooling
- Caching (Redis)
- Load balancing

### Database

- Indexes on frequently queried columns
- Query optimization
- Archive old data
- Regular maintenance

---

## Troubleshooting

### Services won't start

```bash
docker-compose logs
docker-compose restart
```

### Database connection issues

```bash
docker-compose exec postgres psql -U user -d smm_league_prod -c "SELECT 1"
```

### Out of memory

```bash
docker system prune -a
docker-compose down -v
```

### Port conflicts

```bash
# Find process on port
sudo lsof -i :3000
# Kill process
sudo kill -9 <PID>
```

---

## CI/CD Pipeline Integration

The GitHub Actions workflow automatically:

1. Tests on push
2. Builds Docker images
3. Pushes to registry
4. Can auto-deploy on success

See `.github/workflows/ci-cd.yml`

---

## Rollback Procedure

```bash
# List available images
docker images | grep smm-league

# Rollback to previous version
docker-compose down
docker pull <registry>/<image>:previous-tag
docker-compose up -d
```

---

## Support & Maintenance

- Regular security updates
- Monitor error logs
- Backup strategy testing
- Performance optimization
- User feedback integration

---

For more information, see the main README.md and QUICKSTART.md
