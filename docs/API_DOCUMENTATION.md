# 🎯 TappMCP API Documentation

## Overview
Comprehensive API documentation for TappMCP - AI Assistant Enhancement Platform with real-time monitoring, D3.js visualizations, and smart_vibe integration.

## Table of Contents

1. [Core API Endpoints](#core-api-endpoints)
2. [WebSocket API](#websocket-api)
3. [Smart Vibe Tools](#smart-vibe-tools)
4. [Dashboard API](#dashboard-api)
5. [D3.js Visualizations API](#d3js-visualizations-api)
6. [Health Monitoring](#health-monitoring)
7. [Error Handling](#error-handling)

## Core API Endpoints

### Base URL
```
http://localhost:3000
```

**Note**: The enhanced server runs on port 3000 with dashboard at `/dashboard` and health check at `/health`.

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-14T12:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "mcp": "active",
    "websocket": "active",
    "dashboard": "active"
  }
}
```

### Metrics Endpoint
```http
GET /metrics
```

**Response:**
```json
{
  "performance": {
    "cpu": 45.2,
    "memory": 67.8,
    "responseTime": 120,
    "errorRate": 0.02
  },
  "workflows": {
    "active": 3,
    "completed": 15,
    "failed": 1
  },
  "tokens": {
    "used": 1250,
    "saved": 340,
    "costSavings": 45.60
  }
}
```

### Tools List
```http
GET /tools
```

**Response:**
```json
{
  "tools": [
    {
      "name": "smart_vibe",
      "description": "🎯 Smart Vibe - Natural language interface",
      "status": "active"
    },
    {
      "name": "smart_begin",
      "description": "🔍 Smart Begin - Project initialization",
      "status": "active"
    },
    {
      "name": "smart_write",
      "description": "✍️ Smart Write - Code generation",
      "status": "active"
    }
  ]
}
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');
```

### Message Types

#### Performance Metrics
```json
{
  "type": "performance_metrics",
  "data": {
    "timestamp": "2025-01-14T12:00:00Z",
    "cpu": 45.2,
    "memory": 67.8,
    "responseTime": 120,
    "errorRate": 0.02
  }
}
```

#### Workflow Status Update
```json
{
  "type": "workflow_status_update",
  "data": {
    "workflowId": "wf_123",
    "status": "running",
    "progress": 65,
    "phase": "processing"
  }
}
```

#### Token Tracking
```json
{
  "type": "token_tracking",
  "data": {
    "timestamp": "2025-01-14T12:00:00Z",
    "tokensUsed": 1250,
    "tokensSaved": 340,
    "costSavings": 45.60,
    "qualityScore": 92
  }
}
```

## Smart Vibe Tools

### Smart Vibe Tool
```http
POST /tools/smart_vibe
Content-Type: application/json

{
  "command": "create a React todo app",
  "options": {
    "role": "developer",
    "quality": "enterprise",
    "verbosity": "detailed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vibeId": "vibe_1757880416385",
    "message": "🎯 SMART_VIBE ACTIVE - Creating React Todo App",
    "details": {
      "data": {
        "projectStructure": { /* ... */ },
        "qualityScorecard": { /* ... */ },
        "generatedCode": "/* React component code */",
        "techStack": ["React 18", "TypeScript", "Vite"],
        "targetRole": "Senior Developer"
      }
    },
    "nextSteps": [
      "Initialize React project with TypeScript",
      "Set up Vite build system",
      "Create component structure"
    ],
    "learning": {
      "tips": [
        "Use TypeScript for better type safety",
        "Implement proper error boundaries"
      ]
    },
    "metrics": {
      "responseTime": 1247
    }
  }
}
```

### Smart Begin Tool
```http
POST /tools/smart_begin
Content-Type: application/json

{
  "projectName": "My Awesome App",
  "description": "A modern web application",
  "techStack": ["React", "TypeScript", "Node.js"]
}
```

### Smart Write Tool
```http
POST /tools/smart_write
Content-Type: application/json

{
  "prompt": "Create a login component",
  "context": "React TypeScript project",
  "options": {
    "quality": "production",
    "includeTests": true
  }
}
```

## Dashboard API

### Main Dashboard
```http
GET /
```
Returns the main monitoring dashboard HTML.

### D3.js Visualizations
```http
GET /d3-visualizations.html
```
Returns the D3.js visualizations dashboard HTML.

### Dashboard Data
```http
GET /api/dashboard/data
```

**Response:**
```json
{
  "metrics": {
    "performance": { /* ... */ },
    "workflows": { /* ... */ },
    "tokens": { /* ... */ }
  },
  "notifications": [
    {
      "id": "notif_123",
      "type": "info",
      "message": "System running normally",
      "timestamp": "2025-01-14T12:00:00Z"
    }
  ],
  "workflows": [
    {
      "id": "wf_123",
      "name": "Data Processing",
      "status": "running",
      "progress": 65,
      "phase": "processing"
    }
  ]
}
```

## D3.js Visualizations API

### Workflow Graph Data
```http
GET /api/visualizations/workflow
```

**Response:**
```json
{
  "nodes": [
    {
      "id": "start",
      "name": "Start",
      "status": "completed",
      "phase": "Initialization",
      "progress": 100,
      "x": 100,
      "y": 200
    }
  ],
  "connections": [
    {
      "source": "start",
      "target": "process1",
      "type": "sequence"
    }
  ]
}
```

### Performance Chart Data
```http
GET /api/visualizations/performance?timeRange=1h
```

**Query Parameters:**
- `timeRange`: 15m, 1h, 6h, 24h, 7d
- `metrics`: cpu,memory,responseTime,errorRate (comma-separated)

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2025-01-14T12:00:00Z",
      "cpu": 45.2,
      "memory": 67.8,
      "responseTime": 120,
      "errorRate": 0.02
    }
  ],
  "timeRange": "1h",
  "metrics": ["cpu", "memory"]
}
```

### Value Dashboard Data
```http
GET /api/visualizations/value?timeRange=24h
```

**Response:**
```json
{
  "data": [
    {
      "timestamp": "2025-01-14T12:00:00Z",
      "totalTokensUsed": 1250,
      "totalTokensSaved": 340,
      "totalBugsFound": 3,
      "totalCostSavings": 45.60,
      "averageQualityScore": 92
    }
  ]
}
```

### Timeline Data
```http
GET /api/visualizations/timeline?timeRange=24h
```

**Response:**
```json
{
  "events": [
    {
      "id": "event_123",
      "name": "Data Collection",
      "start": "2025-01-14T10:00:00Z",
      "duration": 900000,
      "type": "data"
    }
  ]
}
```

## Health Monitoring

### System Health
```http
GET /health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-14T12:00:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "mcp": {
      "status": "active",
      "uptime": 3600,
      "lastError": null
    },
    "websocket": {
      "status": "active",
      "connections": 5,
      "lastError": null
    },
    "dashboard": {
      "status": "active",
      "uptime": 3600,
      "lastError": null
    }
  },
  "performance": {
    "cpu": 45.2,
    "memory": 67.8,
    "responseTime": 120,
    "errorRate": 0.02
  }
}
```

### Service Status
```http
GET /health/services
```

**Response:**
```json
{
  "services": [
    {
      "name": "mcp",
      "status": "active",
      "uptime": 3600,
      "lastCheck": "2025-01-14T12:00:00Z"
    },
    {
      "name": "websocket",
      "status": "active",
      "connections": 5,
      "lastCheck": "2025-01-14T12:00:00Z"
    }
  ]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "command",
      "issue": "Required field missing"
    },
    "timestamp": "2025-01-14T12:00:00Z",
    "requestId": "req_123"
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request parameters
- `AUTHENTICATION_ERROR` - Authentication failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `INTERNAL_ERROR` - Internal server error

### Error Handling in WebSocket
```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Handle connection errors
};

ws.onclose = (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
  // Handle disconnection
};
```

## Rate Limiting

### Limits
- **API Endpoints**: 100 requests per minute per IP
- **WebSocket**: 10 connections per IP
- **Smart Vibe Tools**: 20 requests per minute per user

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Authentication

### API Key (Optional)
```http
Authorization: Bearer your-api-key-here
```

### WebSocket Authentication
```javascript
const ws = new WebSocket('ws://localhost:3000?token=your-token');
```

## CORS Configuration

### Allowed Origins
- `http://localhost:3000`
- `http://localhost:3001`
- `https://yourdomain.com`

### Headers
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## WebSocket Events

### Client to Server
```javascript
// Subscribe to metrics
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'metrics'
}));

// Unsubscribe from metrics
ws.send(JSON.stringify({
  type: 'unsubscribe',
  channel: 'metrics'
}));
```

### Server to Client
```javascript
// Metrics update
{
  "type": "metrics_update",
  "channel": "metrics",
  "data": { /* metrics data */ }
}

// Workflow update
{
  "type": "workflow_update",
  "channel": "workflows",
  "data": { /* workflow data */ }
}
```

## Examples

### Complete Dashboard Integration
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Subscribe to all channels
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'metrics'
  }));

  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'workflows'
  }));
};

// Handle real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'performance_metrics':
      updatePerformanceChart(data.data);
      break;
    case 'workflow_status_update':
      updateWorkflowGraph(data.data);
      break;
    case 'token_tracking':
      updateValueDashboard(data.data);
      break;
  }
};
```

### Smart Vibe Integration
```javascript
// Use smart_vibe tool
async function useSmartVibe(command, options = {}) {
  const response = await fetch('/tools/smart_vibe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      command,
      options
    })
  });

  const result = await response.json();
  return result.data;
}

// Example usage
const result = await useSmartVibe('create a React component', {
  role: 'developer',
  quality: 'enterprise'
});
```

## Support

For API support and questions:
- **Documentation**: [TappMCP Docs](./README.md)
- **Issues**: GitHub Issues
- **Discord**: TappMCP Community

## Changelog

### v1.0.0 (2025-01-14)
- Initial API release
- Smart Vibe tools integration
- D3.js visualizations API
- WebSocket real-time updates
- Comprehensive health monitoring
