#!/bin/bash

# TappMCP Production Deployment Script
# Deploys with Context7 enabled and production optimizations

set -e

echo "🚀 TappMCP Production Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running ✓"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

print_status "docker-compose is available ✓"

# Create production environment file
print_status "Creating production environment configuration..."

cat > .env.production << EOF
# TappMCP Production Environment
NODE_ENV=production
PORT=3000
HEALTH_PORT=3001

# Context7 Configuration
CONTEXT7_API_KEY=ctx7sk-45825e15-2f53-459e-8688-8c14b0604d02
CONTEXT7_USE_HTTP_ONLY=true
CONTEXT7_ENABLED=true

# Security
SKIP_HEALTH_SERVER=false
ENABLE_CORS=true
CORS_ORIGIN=*

# Performance
MAX_MEMORY=512M
MAX_CPU=0.5
CACHE_TTL=86400000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30s

# Database (if using)
DATABASE_URL=sqlite:///app/data/tappmcp.db
DATABASE_POOL_SIZE=10

# Cache
REDIS_URL=redis://redis:6379
CACHE_REDIS=true
CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000

# SSL/TLS (for production)
SSL_CERT_PATH=/app/certs/cert.pem
SSL_KEY_PATH=/app/certs/key.pem
FORCE_HTTPS=false
EOF

print_success "Production environment file created"

# Create production docker-compose file
print_status "Creating production docker-compose configuration..."

cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  tappmcp-prod:
    build:
      context: .
      dockerfile: Dockerfile.enhanced
    ports:
      - "80:3000"
      - "443:3000"
      - "3001:3001"
      - "9090:9090"
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HEALTH_PORT=3001
      - CONTEXT7_API_KEY=\${CONTEXT7_API_KEY}
      - CONTEXT7_USE_HTTP_ONLY=true
      - CONTEXT7_ENABLED=true
      - SKIP_HEALTH_SERVER=false
      - ENABLE_METRICS=true
      - METRICS_PORT=9090
    volumes:
      - tappmcp-prod-data:/app/data
      - tappmcp-prod-logs:/app/logs
      - tappmcp-prod-cache:/app/cache
    user: "1001:1001"
    command: ["node", "dist/mcp-enhanced-server.js"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    networks:
      - tappmcp-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    restart: unless-stopped
    networks:
      - tappmcp-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - tappmcp-prod
    restart: unless-stopped
    networks:
      - tappmcp-network

volumes:
  tappmcp-prod-data:
    driver: local
  tappmcp-prod-logs:
    driver: local
  tappmcp-prod-cache:
    driver: local
  redis-data:
    driver: local

networks:
  tappmcp-network:
    driver: bridge
EOF

print_success "Production docker-compose file created"

# Create nginx configuration
print_status "Creating nginx configuration..."

cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream tappmcp {
        server tappmcp-prod:3000;
    }

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=health:10m rate=1r/s;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Health check endpoint
        location /health {
            limit_req zone=health burst=5 nodelay;
            proxy_pass http://tappmcp/health;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # API endpoints
        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://tappmcp;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Metrics endpoint
        location /metrics {
            proxy_pass http://tappmcp:9090/metrics;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

print_success "Nginx configuration created"

# Build the application
print_status "Building TappMCP for production..."

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Build TypeScript
print_status "Compiling TypeScript..."
npm run build

print_success "Application built successfully"

# Create production Docker image
print_status "Building production Docker image..."
docker build -f Dockerfile.enhanced -t tappmcp-prod:latest .

print_success "Production Docker image built"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start production deployment
print_status "Starting production deployment..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Health check passed ✓"
else
    print_warning "Health check failed, but deployment may still be starting..."
fi

# Show deployment status
print_status "Deployment Status:"
docker-compose -f docker-compose.prod.yml ps

print_success "🎉 TappMCP Production Deployment Complete!"
echo ""
echo "📊 Deployment Information:"
echo "  - Main Service: http://localhost:3000"
echo "  - Health Check: http://localhost:3001/health"
echo "  - Metrics: http://localhost:9090/metrics"
echo "  - Context7: ✅ Enabled"
echo "  - Redis Cache: ✅ Enabled"
echo "  - Nginx Load Balancer: ✅ Enabled"
echo ""
echo "🔧 Management Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  - Scale: docker-compose -f docker-compose.prod.yml up -d --scale tappmcp-prod=3"
echo ""
print_success "Production deployment is ready! 🚀"
