# Smart MCP Deployment Guide

## Overview

This guide covers deployment options for Smart MCP - an advanced Model Context Protocol (MCP) server with Phase 2 framework capabilities. The deployment system supports local development, Docker containers, and production environments with comprehensive health monitoring and performance optimization.

**Current Status**: Phase 2 Complete (~95%)
- ✅ **Performance**: Sub-millisecond response times (0.1-0.5ms average)
- ✅ **Quality**: 99.1% test success rate (530/535 tests)
- ✅ **Framework**: Complete MCP tool, resource, and prompt system
- ✅ **Security**: Zero critical vulnerabilities

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Development Setup
```bash
# Clone and setup
git clone https://github.com/your-org/TappMCP.git
cd TappMCP
npm ci

# Run quality check (MUST PASS before deployment)
npm run early-check

# Start development server
npm run dev
```

### Docker Deployment
```bash
# Robust deployment with validation
npm run deploy:local

# Standard docker-compose deployment
npm run deploy:docker

# Stop deployment
npm run deploy:stop

# Health check
npm run deploy:health
```

## Available Services

### MCP Tools (Phase 2 Complete)
- **smart-begin**: Project initialization with architecture design
- **smart-write**: Code generation with business context
- **smart-orchestrate**: Workflow orchestration across roles
- **smart-plan**: Enhanced planning with technical analysis
- **smart-finish**: Project completion and quality validation

### Framework Components
- **MCP Framework**: Tool, Resource, and Prompt base classes
- **Resources**: File, API, and Database resource management
- **Prompt Templates**: AI-optimized prompt generation
- **Registry System**: Dynamic tool discovery and management

### Performance Metrics
- **Response Times**: 0.1-0.5ms average (exceeds <50ms target)
- **Test Coverage**: 99.1% success rate (530/535 tests)
- **Quality Score**: Production-ready with strict TypeScript compliance

## Deployment Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run test` - Run test suite with coverage
- `npm run early-check` - **Required** pre-deployment quality check

### Docker Deployment
- `npm run deploy:local` - **Recommended**: Robust deployment with validation, health checks, and rollback
- `npm run deploy:docker` - Standard docker-compose deployment
- `npm run docker:build` - Build Docker image
- `npm run docker:test` - Run tests in Docker container

### Management
- `npm run deploy:stop` - Stop all containers
- `npm run deploy:logs` - View container logs
- `npm run deploy:health` - Check health endpoint (port 3000)
- `npm run deploy:status` - Show container status

### Quality Assurance
- `npm run qa:all` - Run all quality checks
- `npm run qa:eslint` - ESLint code quality
- `npm run qa:typescript` - TypeScript type checking
- `npm run qa:tests` - Test suite with coverage
- `npm run security:scan` - Security vulnerability scanning
- `npm run deploy:monitor` - Show resource usage
- `npm run deploy:rollback` - Rollback to previous state

## Robust Deployment Process

The `npm run deploy:local` command runs a comprehensive deployment process:

### 1. Pre-deployment Validation
- ✅ Docker availability check
- ✅ Quality checks (`npm run early-check`)
- ✅ Build verification

### 2. Clean Deployment
- 🛑 Stop existing containers gracefully
- 🚀 Deploy new container with docker-compose
- 🏥 Health check with retries (30 attempts, 2s interval)

### 3. Rollback on Failure
- 🔄 Automatic rollback if deployment fails
- 📋 Container logs displayed for debugging
- ❌ Clear error reporting

## Health Monitoring

The deployment includes comprehensive health monitoring:

```bash
# Check if service is healthy
curl http://localhost:8080/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-09-05T01:26:50.117Z",
  "uptime": 17.65,
  "memory": {...},
  "version": "0.1.0"
}
```

## Container Configuration

- **Image**: `tappmcp-smart-mcp` (production build)
- **Container**: `tappmcp-smart-mcp-1`
- **Port**: `8080:3000` (external:internal)
- **Memory Limit**: 512MB
- **CPU Limit**: 0.5 cores
- **Security**: Non-root user, read-only filesystem
- **Restart Policy**: unless-stopped

## Troubleshooting

### Deployment Fails
1. Check logs: `npm run deploy:logs`
2. Check container status: `npm run deploy:status`
3. Try rollback: `npm run deploy:rollback`
4. Manual cleanup: `npm run deploy:stop`

### Health Check Fails
1. Wait 30-60 seconds for startup
2. Check if container is running: `docker ps`
3. Check logs for errors: `npm run deploy:logs`
4. Verify port 8080 is not in use: `netstat -an | grep 8080`

### Port Conflicts
If port 8080 is in use:
```bash
# Find what's using the port
netstat -ano | findstr :8080

# Stop the process or change port in docker-compose.yml
```

### Container Won't Start
1. Check Docker Desktop is running
2. Verify image exists: `docker images tappmcp-smart-mcp`
3. Check for resource constraints
4. Review container logs: `docker logs tappmcp-smart-mcp-1`

## Manual Operations

### Build Only
```bash
docker-compose build
```

### Start Without Rebuild
```bash
docker-compose up -d
```

### View Logs in Real-time
```bash
docker-compose logs -f
```

### Execute Commands in Container
```bash
docker exec -it tappmcp-smart-mcp-1 /bin/sh
```

### Clean Everything
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi tappmcp-smart-mcp

# Remove volumes
docker volume rm tappmcp_smart-mcp-data
```

## Security Features

The deployment includes security hardening:
- Non-root user execution
- Read-only filesystem
- No new privileges
- Temporary filesystem restrictions
- Memory and CPU limits
- Restart policies

## Monitoring and Logs

### Real-time Monitoring
```bash
# Resource usage
npm run deploy:monitor

# Live logs
npm run deploy:logs

# Container details
docker inspect tappmcp-smart-mcp-1
```

### Log Files
Deployment logs are saved to:
- Console output with colored formatting
- Container logs accessible via Docker

## Production Considerations

While this is designed for local deployment, key production-ready features:
- Health checks with proper timeouts
- Graceful container management
- Resource limits
- Security hardening
- Rollback capabilities
- Comprehensive validation

## Environment Variables

Set these in `docker-compose.yml` if needed:
- `NODE_ENV=production`
- `PORT=3000`
- Additional environment variables as required

## Support

For issues:
1. Check deployment logs
2. Verify Docker Desktop is running
3. Ensure no port conflicts
4. Check container resource usage
5. Review error messages in deployment output
