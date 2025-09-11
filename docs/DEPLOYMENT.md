# TappMCP Deployment Guide

## 🚀 Production Deployment with Docker

TappMCP is designed for production deployment using Docker containers with comprehensive health monitoring and smoke testing.

### Prerequisites

- Docker installed and running
- Node.js 18+ (for development)
- Git (for source code)

### Quick Production Deployment

```bash
# 1. Clone repository
git clone <repository-url>
cd TappMCP

# 2. Build production container
docker build -t smart-mcp:latest .

# 3. Deploy container
docker run -d \
  --name smart-mcp \
  -p 3000:3000 \
  -p 3001:3001 \
  -v smart-mcp-data:/app/data \
  smart-mcp:latest

# 4. Verify deployment
curl http://localhost:3001/health

# 5. Run comprehensive smoke test
NODE_ENV=test npx vitest run src/deployment/smoke-test.test.ts
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  smart-mcp:
    build: .
    container_name: smart-mcp
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      NODE_ENV: production
      HEALTH_PORT: 3001
    volumes:
      - smart-mcp-data:/app/data
      - smart-mcp-logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      start_period: 30s
      retries: 3
    restart: unless-stopped

volumes:
  smart-mcp-data:
  smart-mcp-logs:
```

### Manual Deployment

```bash
# Build for production
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=3000

# Start server
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `HEALTH_PORT` | `3001` | Health check port |

## Health Monitoring

TappMCP provides comprehensive health monitoring endpoints:

### Health Check Endpoint
```bash
GET http://localhost:3001/health
```

**Healthy Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T05:52:55.374Z",
  "uptime": 14.170468918,
  "memory": {
    "rss": 59060224,
    "heapTotal": 11780096,
    "heapUsed": 10283744,
    "external": 2321801,
    "arrayBuffers": 106619
  },
  "version": "0.1.0"
}
```

### Readiness Check Endpoint
```bash
GET http://localhost:3001/ready
```

**Ready Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-09-11T05:52:59.704Z"
}
```

### MCP Client Integration

#### Cursor Integration

Add to Cursor MCP configuration:

**Direct Connection:**
```json
{
  "mcpServers": {
    "smart-mcp": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/path/to/TappMCP",
      "env": {
        "NODE_ENV": "production",
        "HEALTH_PORT": "3001"
      },
      "stdio": true
    }
  }
}
```

**Docker Container Connection:**
```json
{
  "mcpServers": {
    "smart-mcp-container": {
      "command": "docker",
      "args": ["exec", "-i", "smart-mcp", "node", "dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      },
      "stdio": true
    }
  }
}
```

## Security

### Production Checklist
- [ ] Run security scans: `npm run security:scan`
- [ ] Update dependencies: `npm audit fix`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring alerts
- [ ] Configure log rotation
- [ ] Implement rate limiting

### Security Headers
```javascript
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
```

## Performance

### Optimization
- Enable Node.js clustering
- Use PM2 for process management
- Configure nginx reverse proxy
- Enable gzip compression
- Implement caching strategy

### PM2 Configuration
```json
{
  "apps": [{
    "name": "tappmcp",
    "script": "./dist/server.js",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
lsof -i :3000
kill -9 <PID>
```

**Memory Issues**
```bash
node --max-old-space-size=4096 dist/server.js
```

**Permission Denied**
```bash
sudo chown -R $USER:$USER /app
chmod +x dist/server.js
```

## Rollback Procedure

```bash
# Tag current version
git tag -a v1.0.0 -m "Production release"

# Rollback if needed
docker-compose down
git checkout <previous-tag>
npm run docker:build
docker-compose up -d
```