# TappMCP Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for development)
- At least 512MB available memory

## ⚠️ CRITICAL: Deployment Configuration

**ALWAYS USE**: `docker-compose.yml` (ports 8080/8081)

### Correct Two-Level Architecture:
1. **Level 1**: Docker container `tappmcp-smart-mcp-1` on ports 8080:3000 and 8081:3001
2. **Level 2**: Cursor MCP integration via `smart-mcp-compose` configuration

### Deployment Commands:
```bash
# ✅ CORRECT - Use main docker-compose.yml
docker-compose up -d

# Use the standard docker-compose.yml for all deployments
```

### Container Name Must Be:
- ✅ `tappmcp-smart-mcp-1` (matches cursor-mcp-config.json)
- ❌ `smart-mcp-prod` (wrong container name)

### Production Deployment

1. **Build and Start**
   ```bash
   # Build production image
   docker build -t smart-mcp:latest .

   # Start with Docker Compose (recommended)
   docker-compose up -d smart-mcp

   # Or start manually
   docker run -d \
     -p 8080:3000 \
     -p 8081:3001 \
     --name smart-mcp-prod \
     smart-mcp:latest
   ```

2. **Health Verification**
   ```bash
   # Check health endpoint
   curl http://localhost:8081/health

   # Check readiness
   curl http://localhost:8081/ready

   # Verify container status
   docker ps
   ```

## 🏗️ Architecture

### Container Structure
- **Base Image**: `node:20-alpine` (production optimized)
- **User**: Non-root user `smartmcp` (UID 1001)
- **Ports**:
  - `3000` - MCP Server (stdio protocol)
  - `3001` - Health monitoring endpoints
- **Security**: Read-only filesystem, no new privileges

### Multi-Stage Build
1. **Builder Stage**: Installs dependencies and compiles TypeScript
2. **Production Stage**: Only production dependencies and compiled code

### Health Monitoring
- **Health Check**: `/health` - Full system status with metrics
- **Readiness Check**: `/ready` - Simple ready status
- **Docker Health**: Built-in Docker health check every 30s

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production          # Required for production mode
PORT=3000                    # MCP server port
HEALTH_PORT=3001            # Health monitoring port
```

### Resource Limits (Docker Compose)
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 📊 Monitoring

### Health Endpoints

**Health Check (`/health`)**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T20:30:05.740Z",
  "uptime": 4.171793517,
  "memory": {
    "rss": 64421888,
    "heapTotal": 18071552,
    "heapUsed": 11697832,
    "external": 2712031,
    "arrayBuffers": 493110
  },
  "version": "0.1.0"
}
```

**Readiness Check (`/ready`)**
```json
{
  "status": "ready",
  "timestamp": "2025-09-11T20:30:36.458Z"
}
```

### Docker Health Check
```bash
# Check container health status
docker inspect smart-mcp-prod | grep -A 10 '"Health"'

# View health check logs
docker logs smart-mcp-prod
```

## 🔐 Security Features

### Container Security
- Non-root user execution (smartmcp:1001)
- Read-only filesystem
- No new privileges
- Temporary filesystem for `/tmp` (100MB, noexec, nosuid)

### Network Security
- Only necessary ports exposed
- Health monitoring on separate port
- Internal communication via Docker networks

## 🚦 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Stop conflicting containers
docker stop $(docker ps -q --filter "publish=8080")
docker stop $(docker ps -q --filter "publish=8081")
```

**Container Won't Start**
```bash
# Check logs
docker logs smart-mcp-prod

# Check resource usage
docker stats smart-mcp-prod
```

**Health Check Failures**
```bash
# Manual health check
curl -f http://localhost:8081/health || echo "Health check failed"

# Check health history
docker inspect smart-mcp-prod | jq '.[0].State.Health'
```

### Performance Tuning

**Memory Optimization**
- Default limit: 512MB
- Minimum: 256MB
- Monitor with: `docker stats smart-mcp-prod`

**CPU Optimization**
- Default limit: 0.5 CPU
- Minimum: 0.25 CPU
- Scale based on load

## 📈 Production Readiness

### Validated Features ✅
- Docker multi-stage build
- Health monitoring endpoints
- Security hardening
- Resource limitations
- Graceful shutdown handling
- Smart Vibe natural language interface
- VibeTapp integration
- Context7 AI enhancement
- TypeScript compilation (zero errors)
- Test coverage: 93.3% pass rate

### MCP Tools Available
- `smart_vibe` - Natural language interface
- `smart_begin` - Project initialization
- `smart_plan` - Project planning
- `smart_write` - Code generation
- `smart_finish` - Project completion
- `smart_orchestrate` - Multi-tool workflows

## 🔄 Maintenance

### Updates
```bash
# Rebuild with latest changes
docker build -t smart-mcp:latest .

# Rolling update
docker-compose up -d --force-recreate smart-mcp
```

### Backup
```bash
# Export volumes
docker run --rm -v smart-mcp-data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
docker run --rm -v smart-mcp-logs:/logs -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz -C /logs .
```

### Scaling
```bash
# Scale with Docker Compose
docker-compose up -d --scale smart-mcp=3

# Or use Docker Swarm/Kubernetes for production scaling
```
