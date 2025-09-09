# Deployment Guide

## Production Deployment

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
docker-compose up -d

# Check health
npm run deploy:health

# View logs
npm run deploy:logs
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  tappmcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
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

```bash
NODE_ENV=production     # Environment mode
PORT=3000              # Server port
LOG_LEVEL=info         # Logging level
MAX_WORKERS=4          # Worker processes
```

## Health Monitoring

Health endpoint available at:
```
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 123456,
  "memory": {
    "used": 52428800,
    "total": 134217728
  },
  "timestamp": "2025-01-09T10:00:00Z"
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