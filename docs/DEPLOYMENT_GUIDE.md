# 🚀 TappMCP Deployment Guide

## Overview
Comprehensive deployment guide for TappMCP - AI Assistant Enhancement Platform with real-time monitoring, D3.js visualizations, and smart_vibe integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Docker**: v20.0.0 or higher (for containerized deployment)
- **Memory**: Minimum 2GB RAM, Recommended 4GB+
- **Storage**: Minimum 1GB free space
- **Network**: Ports 3000, 3001 available

### Development Tools
- **Git**: For version control
- **VS Code/Cursor**: Recommended IDE
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/TappMCP.git
cd TappMCP
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm ci

# Verify installation
npm run verify
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Server Configuration
PORT=3000
HEALTH_PORT=3001
NODE_ENV=development

# WebSocket Configuration
WS_PORT=3000
WS_PATH=/ws

# Context7 Integration (Optional)
CONTEXT7_API_KEY=your_api_key_here
CONTEXT7_BASE_URL=https://api.context7.com

# Database (Optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/tappmcp

# Security
JWT_SECRET=your_jwt_secret_here
API_RATE_LIMIT=100
```

### 4. Start Development Server
```bash
# Start with hot reload
npm run dev

# Or start production build
npm start
```

### 5. Verify Installation
```bash
# Check health endpoint
curl http://localhost:3000/health

# Check tools endpoint
curl http://localhost:3000/tools

# Open dashboard
open http://localhost:3000
```

## Docker Deployment

### 1. Build Docker Image
```bash
# Build production image
docker build -t tappmcp:latest .

# Build with specific tag
docker build -t tappmcp:v1.0.0 .
```

### 2. Run Container
```bash
# Basic run
docker run -d \
  --name tappmcp \
  -p 3000:3000 \
  -p 3001:3001 \
  tappmcp:latest

# With environment variables
docker run -d \
  --name tappmcp \
  -p 3000:3000 \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HEALTH_PORT=3001 \
  tappmcp:latest
```

### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  tappmcp:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HEALTH_PORT=3001
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/TappMCP.git
cd TappMCP

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration (Optional)
```nginx
# /etc/nginx/sites-available/tappmcp
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tappmcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment Configuration

### Development Environment
```env
NODE_ENV=development
PORT=3000
HEALTH_PORT=3001
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### Staging Environment
```env
NODE_ENV=staging
PORT=3000
HEALTH_PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=https://staging.your-domain.com
```

### Production Environment
```env
NODE_ENV=production
PORT=3000
HEALTH_PORT=3001
LOG_LEVEL=warn
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your_strong_jwt_secret_here
API_RATE_LIMIT=100
```

## Monitoring & Health Checks

### Health Endpoints
```bash
# Basic health check
curl http://localhost:3000/health

# Detailed health check
curl http://localhost:3000/health/detailed

# Service status
curl http://localhost:3000/health/services
```

### Monitoring Scripts
```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ TappMCP is healthy"
    exit 0
else
    echo "❌ TappMCP is unhealthy (HTTP $RESPONSE)"
    exit 1
fi
```

### Log Monitoring
```bash
# View application logs
pm2 logs tappmcp

# View specific log files
tail -f logs/app.log
tail -f logs/error.log

# Monitor in real-time
pm2 monit
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3000

# Kill process using port
sudo kill -9 <PID>

# Or change port in environment
export PORT=3001
```

#### 2. WebSocket Connection Failed
```bash
# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://localhost:3000/ws

# Check firewall settings
sudo ufw status
sudo ufw allow 3000
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 4. Docker Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs tappmcp

# Restart container
docker restart tappmcp

# Remove and recreate
docker rm tappmcp
docker run -d --name tappmcp -p 3000:3000 tappmcp:latest
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=tappmcp:*
npm start

# Or with PM2
pm2 start ecosystem.config.js --env production --log-date-format="YYYY-MM-DD HH:mm:ss Z"
```

### Performance Issues
```bash
# Check CPU usage
top -p $(pgrep -f "node.*tappmcp")

# Check memory usage
ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem | grep node

# Monitor network
netstat -i
ss -tuln
```

## Performance Optimization

### 1. Node.js Optimization
```bash
# Increase max listeners
export NODE_OPTIONS="--max-listeners=100"

# Enable clustering
export CLUSTER_MODE=true
export CLUSTER_WORKERS=4
```

### 2. Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX idx_tokens_date ON token_tracking(created_at);
```

### 3. Caching Strategy
```javascript
// Enable Redis caching
export REDIS_URL=redis://localhost:6379
export CACHE_TTL=3600

// Enable response caching
export ENABLE_RESPONSE_CACHE=true
```

### 4. Load Balancing
```nginx
# nginx.conf
upstream tappmcp_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://tappmcp_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

### 1. Environment Security
```bash
# Secure environment files
chmod 600 .env
chown root:root .env

# Use secrets management
export JWT_SECRET=$(openssl rand -base64 32)
```

### 2. Network Security
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

### 3. Application Security
```javascript
// Enable security headers
app.use(helmet());

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## Backup & Recovery

### 1. Data Backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/tappmcp"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/tappmcp_data_$DATE.tar.gz data/

# Backup logs
tar -czf $BACKUP_DIR/tappmcp_logs_$DATE.tar.gz logs/

# Backup configuration
cp .env $BACKUP_DIR/env_$DATE
```

### 2. Recovery Process
```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
BACKUP_DIR="/backups/tappmcp"

# Stop application
pm2 stop tappmcp

# Restore data
tar -xzf $BACKUP_DIR/$BACKUP_FILE -C /

# Restart application
pm2 start tappmcp
```

## Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  tappmcp:
    build: .
    ports:
      - "3000-3002:3000"
    environment:
      - NODE_ENV=production
      - CLUSTER_MODE=true
      - CLUSTER_WORKERS=2
    deploy:
      replicas: 3
```

### Vertical Scaling
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Increase file descriptors
ulimit -n 65536

# Optimize garbage collection
export NODE_OPTIONS="--gc-interval=100 --max-semi-space-size=128"
```

## Maintenance

### Regular Maintenance Tasks
```bash
#!/bin/bash
# maintenance.sh

# Update dependencies
npm update

# Clean old logs
find logs/ -name "*.log" -mtime +30 -delete

# Restart application
pm2 restart tappmcp

# Check disk space
df -h

# Check memory usage
free -h
```

### Automated Maintenance
```bash
# Add to crontab
crontab -e

# Daily maintenance at 2 AM
0 2 * * * /path/to/maintenance.sh

# Weekly log rotation
0 3 * * 0 /usr/sbin/logrotate /etc/logrotate.d/tappmcp
```

## Support

### Getting Help
- **Documentation**: [TappMCP Docs](./README.md)
- **API Reference**: [API Documentation](./API_DOCUMENTATION.md)
- **Issues**: GitHub Issues
- **Community**: Discord Server

### Log Collection
```bash
# Collect logs for support
tar -czf tappmcp_logs_$(date +%Y%m%d).tar.gz \
  logs/ \
  /var/log/pm2/ \
  /var/log/nginx/error.log
```

## Changelog

### v1.0.0 (2025-01-14)
- Initial deployment guide
- Docker and production deployment
- Monitoring and troubleshooting
- Performance optimization
- Security considerations
