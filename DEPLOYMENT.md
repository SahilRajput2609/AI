# AI-Company Deployment Guide

## Prerequisites

- Node.js 18+ LTS
- npm 9+
- SQLite 3
- Git

## Environment Setup

### 1. Create Environment File

```bash
cp .env.example .env
```

Fill in required environment variables for production.

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Project

```bash
npm run build
```

## Deployment Steps

### Development Server

```bash
npm run dev
```

Runs dashboard at http://localhost:5173 and server at http://localhost:3001

### Production Server

```bash
npm run build
npm start
```

Starts server at http://localhost:3001

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/apps/server/index.js"]
```

### Environment Variables Required

- JWT_SECRET: Secret key for JWT authentication
- DATABASE_URL: Path to SQLite database
- CORS_ORIGIN: Allowed CORS origin
- NODE_ENV: production or development
- PORT: Server port (default 3001)

### Health Checks

```bash
curl http://localhost:3001/api/health
```

### Database Backup

```bash
cp data/ai-company.db data/ai-company.backup.db
```

## CI/CD Pipeline

GitHub Actions configured to:

1. Run tests on every push
2. Type check with TypeScript
3. Lint with ESLint
4. Format check with Prettier
5. Build project
6. Security audit

## Monitoring

Key metrics:
- Response time: < 500ms p95
- Error rate: < 0.1%
- CPU usage: < 70%
- Memory usage: < 70%

## Scaling

- Multiple server instances with load balancer
- Consider PostgreSQL for database scaling
- Use Redis for caching

## Next Steps

- [ ] Setup monitoring dashboard
- [ ] Configure automated backups
- [ ] Setup SSL certificates
- [ ] Configure custom domain
- [ ] Enable rate limiting
- [ ] Setup alerting
