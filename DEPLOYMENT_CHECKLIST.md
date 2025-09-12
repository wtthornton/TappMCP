# TappMCP Deployment Checklist

## ⚠️ CRITICAL DEPLOYMENT RULES

### ✅ CORRECT Deployment
```bash
# Use main docker-compose.yml
docker-compose up -d

# Result: Container name tappmcp-smart-mcp-1
# Ports: 8080:3000 and 8081:3001
# Matches: cursor-mcp-config.json smart-mcp-compose
```

### ❌ WRONG Deployments (NEVER USE)
```bash
# ❌ WRONG: Manual docker run (wrong container name)
docker run -d --name smart-mcp-prod -p 8080:3000 -p 8081:3001 smart-mcp:latest
# Always use docker-compose.yml instead
```

## 🔍 Verification Steps

### 1. Check Container Name
```bash
docker ps
# Must show: tappmcp-smart-mcp-1
# NOT: smart-mcp-prod
```

### 2. Check Ports
```bash
docker ps
# Must show: 0.0.0.0:8080->3000/tcp, 0.0.0.0:8081->3001/tcp
# NOT: 0.0.0.0:3010->3000/tcp, 0.0.0.0:3011->3001/tcp
```

### 3. Check Health
```bash
curl http://localhost:8081/health
# Must return: {"status":"healthy",...}
```

### 4. Check Cursor MCP Config Match
```json
// cursor-mcp-config.json must have:
"smart-mcp-compose": {
  "args": ["exec", "-i", "tappmcp-smart-mcp-1", "node", "dist/server.js"]
}
```

## 🚨 Common Mistakes

1. **Wrong Container Name**: Getting `smart-mcp-prod` instead of `tappmcp-smart-mcp-1`
2. **Manual Docker Run**: Bypassing docker-compose and getting wrong container name
3. **Wrong Ports**: Not using standard 8080/8081 ports

## 🔧 Quick Fix Commands

### If Wrong Container is Running:
```bash
# Stop wrong container
docker stop smart-mcp-prod

# Start correct container
docker-compose up -d

# Verify
docker ps
```

### If Wrong Ports:
```bash
# Stop all containers
docker-compose down

# Start with correct compose file
docker-compose up -d

# Verify ports
docker ps
```

## 📋 Pre-Deployment Checklist

- [ ] Using `docker-compose.yml` (not production.yml)
- [ ] Container name will be `tappmcp-smart-mcp-1`
- [ ] Ports will be 8080:3000 and 8081:3001
- [ ] Matches `cursor-mcp-config.json` configuration
- [ ] Health endpoint accessible at localhost:8081/health

## 🎯 Success Criteria

✅ **Two-Level Deployment Working**:
- Level 1: Docker container `tappmcp-smart-mcp-1` running
- Level 2: Cursor MCP integration via `smart-mcp-compose` config
- Health check: `http://localhost:8081/health` returns healthy
- Container shows in Docker dashboard with correct name and ports
