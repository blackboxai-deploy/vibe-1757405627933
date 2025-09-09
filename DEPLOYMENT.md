# 🚀 Deployment Guide - BWC Academy Platform

This guide covers multiple deployment options for the BWC Academy Roblox game development platform.

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Environment variables configured
- Domain name (for production)

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# 3. Build the application
npm run build --no-lint

# 4. Start production server
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended for local/development)

```bash
# Start MongoDB and the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- MongoDB on port 27017
- Next.js app on port 3000

### Option 2: Docker Build Only

```bash
# Build the image
docker build -t bwc-academy .

# Run with external MongoDB
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  bwc-academy
```

## ☁️ Vercel Deployment (Recommended for Production)

### Automatic Deployment

1. **Connect to GitHub**
   - Push code to GitHub repository
   - Connect repository to Vercel dashboard

2. **Set Environment Variables** in Vercel dashboard:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/elearning
   JWT_SECRET=your-super-secret-key-minimum-32-characters
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel automatically builds and deploys on git push
   - Custom domain configuration available in dashboard

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

## 🌐 AWS Deployment

### AWS ECS with Fargate

1. **Build and Push to ECR**:
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name bwc-academy

   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag
   docker build -t bwc-academy .
   docker tag bwc-academy:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/bwc-academy:latest

   # Push
   docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/bwc-academy:latest
   ```

2. **Create ECS Task Definition** with:
   - Container image: Your ECR URI
   - Port mappings: 3000
   - Environment variables: MONGODB_URI, JWT_SECRET
   - Memory: 512 MB, CPU: 256 units

3. **Create ECS Service** with:
   - Application Load Balancer
   - Target group on port 3000
   - Auto Scaling (optional)

## 📊 Database Setup

### MongoDB Atlas (Cloud - Recommended)

1. **Create Cluster** at [MongoDB Atlas](https://cloud.mongodb.com)
2. **Get Connection String**:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/elearning?retryWrites=true&w=majority
   ```
3. **Configure Network Access** to allow your deployment IP
4. **Create Database User** with read/write permissions

### Local MongoDB

```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/elearning
```

## 🔐 Environment Variables

Create `.env.local` (development) or set in your deployment platform:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/elearning

# Authentication
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Environment
NODE_ENV=production

# Optional: Admin user for first-time setup
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
```

## 🛠️ Post-Deployment Setup

### 1. Database Seeding (Development Only)

```bash
# Call the seed endpoint (only works in development)
curl -X POST https://your-domain.com/api/seed

# Or create admin user manually via signup page
```

### 2. Domain Configuration

For production deployments:
- Configure DNS to point to your deployment
- Set up SSL certificates (automatic with Vercel/Netlify)
- Configure CORS if needed

### 3. Monitoring

Set up monitoring for:
- Application health checks
- Database connectivity
- Response times
- Error rates

## 🚦 Health Checks

The application includes health check endpoints:

```bash
# Check if app is running
curl https://your-domain.com/

# Check API health
curl https://your-domain.com/api/auth/me
```

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build --no-lint
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID}}
        vercel-project-id: ${{ secrets.PROJECT_ID}}
        vercel-args: '--prod'
```

## 📈 Performance Optimization

### Production Checklist

- [ ] Enable compression (gzip/brotli)
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable caching headers
- [ ] Monitor bundle size
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure monitoring (New Relic, DataDog)

### Database Optimization

```javascript
// Add indexes for better performance
db.users.createIndex({ email: 1 })
db.courses.createIndex({ targetGrades: 1, isActive: 1 })
db.announcements.createIndex({ targetGrades: 1, isActive: 1, createdAt: -1 })
```

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   ```bash
   # Check connection string format
   # Ensure network access is configured
   # Verify database user permissions
   ```

2. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build --no-lint
   ```

3. **Authentication Issues**
   ```bash
   # Verify JWT_SECRET is set and consistent
   # Check cookie settings for production domain
   # Ensure HTTPS in production
   ```

### Logs and Debugging

```bash
# Vercel logs
vercel logs

# Docker logs
docker-compose logs app

# Local development logs
npm run build --no-lint && npm start
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review environment variables
3. Verify database connectivity
4. Check application logs
5. Ensure all dependencies are installed

---

**The BWC Academy platform is now ready for production deployment! 🚀**