# Local Production Deployment Guide

## Quick Start

Deploy the MCP server locally with a single command:

```bash
node scripts/deploy-local-production.js
```

## Prerequisites

- Docker installed and running
- Node.js 18+ installed
- Port 8080 available

## Deployment Process

The deployment script automatically:
1. Checks Docker availability
2. Builds the TypeScript application
3. Stops any existing deployment
4. Builds and starts the Docker container
5. Waits for health checks to pass
6. Verifies the deployment

## Testing the Deployment

After deployment, test the MCP server:

```bash
node scripts/test-mcp-deployment.js
```

This runs 4 tests:
- Health endpoint verification
- MCP STDIO communication
- Available tools listing
- Tool execution (smart_begin)

## Management Commands

```bash
# View logs
npm run deploy:logs

# Check status
npm run deploy:status

# Monitor resources
npm run deploy:monitor

# Stop deployment
npm run deploy:stop
```

## Architecture

- **Port**: 8080 (host) → 3000 (container)
- **Container**: `tappmcp-smart-mcp-1`
- **Health Check**: Every 30 seconds
- **Resources**: 512MB memory limit, 0.5 CPU
- **Restart Policy**: Unless stopped

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs --tail=50

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Health check failing
```bash
# Test health endpoint directly
curl http://localhost:8080/health

# Check container health
docker inspect tappmcp-smart-mcp-1 --format='{{.State.Health.Status}}'
```

### Port already in use
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "8081:3000"  # Change 8080 to another port
```

## MCP Server Capabilities

Once deployed, the server provides:
- `smart_begin` - Initialize AI development session
- `smart_plan` - Create development plan
- `smart_write` - Generate code
- `smart_finish` - Complete and review session
- `smart_orchestrate` - Coordinate multiple tools

Access via MCP protocol over STDIO or integrate with Claude/Cursor.