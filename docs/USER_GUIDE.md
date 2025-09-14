# 🎯 TappMCP User Guide

## Overview
Complete user guide for TappMCP - AI Assistant Enhancement Platform with real-time monitoring, D3.js visualizations, and smart_vibe integration.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Main Dashboard](#main-dashboard)
3. [D3.js Visualizations](#d3js-visualizations)
4. [Smart Vibe Tools](#smart-vibe-tools)
5. [WebSocket Integration](#websocket-integration)
6. [API Usage](#api-usage)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Features](#advanced-features)

## Getting Started

### Accessing TappMCP
1. **Main Dashboard**: `http://localhost:3000`
2. **D3.js Visualizations**: `http://localhost:3000/d3-visualizations.html`
3. **API Endpoints**: `http://localhost:3000/api/*`

### First Time Setup
1. Ensure TappMCP server is running
2. Open your browser to the main dashboard
3. Check the connection status indicator (should be green)
4. Explore the different sections and features

## Main Dashboard

### Dashboard Overview
The main dashboard provides a comprehensive view of your TappMCP system with real-time updates.

#### Key Sections

**1. System Status Panel**
- 🟢 **Green**: System healthy and operational
- 🟡 **Yellow**: System degraded but functional
- 🔴 **Red**: System error or offline

**2. Performance Metrics**
- **CPU Usage**: Current CPU utilization percentage
- **Memory Usage**: RAM consumption percentage
- **Response Time**: Average API response time
- **Error Rate**: Percentage of failed requests

**3. Active Workflows**
- Real-time list of running workflows
- Progress bars showing completion status
- Status indicators (Running, Pending, Completed, Failed)

**4. Token Tracking**
- Total tokens used in current session
- Tokens saved through optimization
- Cost savings achieved
- Quality score metrics

**5. Notification Center**
- Real-time system alerts
- Workflow status updates
- Error notifications
- Success confirmations

### Navigation
- **Refresh**: Click the refresh button to update data
- **Settings**: Access configuration options
- **Help**: View this user guide
- **D3.js Visualizations**: Navigate to advanced charts

## D3.js Visualizations

### Accessing Visualizations
Navigate to `http://localhost:3000/d3-visualizations.html` or click the "📈 D3.js Visualizations" link from the main dashboard.

### Available Visualizations

#### 1. Interactive Workflow Graph
**Purpose**: Visual representation of workflow processes and dependencies.

**Features**:
- **Force Simulation**: Nodes automatically position themselves
- **Zoom & Pan**: Use mouse wheel to zoom, drag to pan
- **Drag & Drop**: Reposition nodes by dragging
- **Status Colors**:
  - 🟢 Green: Completed
  - 🟡 Orange: Running
  - ⚪ Gray: Pending
  - 🔴 Red: Failed

**Controls**:
- **Status Filter**: Filter nodes by status
- **Phase Filter**: Filter by workflow phase
- **Layout**: Choose between Force Directed, Grid, or Hierarchical
- **Reset**: Reset all filters
- **Export**: Download data as CSV

#### 2. Performance Monitoring Charts
**Purpose**: Real-time system performance tracking.

**Features**:
- **Multi-line Charts**: CPU and memory usage over time
- **Interactive Legends**: Click to show/hide metrics
- **Time Range Selection**: 15m, 1h, 6h, 24h, 7d
- **Chart Types**: Line, Area, Bar

**Controls**:
- **Time Range**: Select data time period
- **Metrics**: Choose which metrics to display
- **Chart Type**: Switch between visualization types
- **Reset**: Reset to default settings
- **Export**: Download performance data

#### 3. Value Dashboard
**Purpose**: Track token usage, cost savings, and quality metrics.

**Features**:
- **Token Tracking**: Visualize token consumption and savings
- **Cost Analysis**: Monitor financial impact
- **Quality Metrics**: Track bugs found and quality scores
- **Trend Analysis**: View performance over time

**Controls**:
- **Time Range**: Select analysis period
- **Metrics Filter**: Choose specific metrics
- **Chart Type**: Switch visualization styles
- **Reset**: Reset filters
- **Export**: Download value data

#### 4. Timeline View
**Purpose**: Gantt-style timeline of workflow events.

**Features**:
- **Event Timeline**: Chronological view of activities
- **Color Coding**: Different colors for event types
- **Duration Bars**: Visual representation of time spent
- **Hover Details**: Additional information on hover

**Controls**:
- **Time Range**: Select timeline period
- **Event Types**: Filter by event category
- **View Type**: Gantt, Timeline, or List view
- **Reset**: Reset filters
- **Export**: Download timeline data

### Real-time Updates
All visualizations update automatically via WebSocket connection:
- **Live Data Mode**: Green indicator shows real-time connection
- **Demo Data Mode**: Orange indicator shows simulated data
- **Connection Status**: Check the status indicator in each section

## Smart Vibe Tools

### What is Smart Vibe?
Smart Vibe is TappMCP's enhanced natural language interface that provides:
- 🎯 **Visual Indicators**: Clear formatting and structured responses
- 📊 **Quality Analysis**: Detailed project insights and metrics
- 🚀 **Next Steps**: Numbered action items and recommendations
- 💡 **Learning Tips**: Best practices and expert advice
- ⏱️ **Performance Metrics**: Response time and efficiency data

### Using Smart Vibe

#### Basic Usage
```
smart_vibe "your request here"
```

**Examples**:
```
smart_vibe "create a React todo app"
smart_vibe "check my code quality"
smart_vibe "improve this function"
smart_vibe "status"
```

#### Advanced Usage
```
smart_vibe "your request" {
  "role": "developer",
  "quality": "enterprise",
  "verbosity": "detailed"
}
```

**Available Options**:
- **Role**: developer, designer, qa-engineer, operations-engineer, product-strategist
- **Quality**: basic, standard, enterprise, production
- **Verbosity**: minimal, standard, detailed
- **Mode**: basic, advanced, power

#### Smart Vibe Response Format
When smart_vibe is active, you'll see:
```
🎯 SMART_VIBE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Quality Scorecard: 95/100 ✅
🛠️ Tech Stack: React 18, TypeScript, D3.js
👤 Target Role: Senior Developer
🚀 Next Steps:
1. Initialize React project with TypeScript
2. Set up Vite build system
3. Create component structure
💡 Tips:
• Use TypeScript for better type safety
• Implement proper error boundaries
⏱️ Response Time: 1,247ms
```

### Available Tools

#### 1. Smart Begin
**Purpose**: Project initialization and setup
```
smart_begin "create a new web application"
```

#### 2. Smart Write
**Purpose**: Code generation and improvement
```
smart_write "create a login component"
```

#### 3. Smart Plan
**Purpose**: Technical planning and architecture
```
smart_plan "design a microservices architecture"
```

#### 4. Smart Orchestrate
**Purpose**: Full SDLC automation
```
smart_orchestrate "build a complete e-commerce platform"
```

#### 5. Smart Finish
**Purpose**: Project completion and validation
```
smart_finish "finalize and deploy my application"
```

#### 6. Smart Converse
**Purpose**: Advanced conversation and analysis
```
smart_converse "analyze my codebase for improvements"
```

## WebSocket Integration

### Real-time Data
TappMCP uses WebSocket connections to provide real-time updates to all visualizations and dashboards.

#### Connection Status
- **🟢 Connected**: Real-time data streaming active
- **🟡 Connecting**: Attempting to establish connection
- **🔴 Disconnected**: No real-time updates available

#### Data Types
1. **Performance Metrics**: CPU, memory, response time, error rate
2. **Workflow Updates**: Status changes, progress updates
3. **Token Tracking**: Usage, savings, cost analysis
4. **System Alerts**: Notifications and status changes

#### JavaScript Integration
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Handle connection
ws.onopen = () => {
    console.log('Connected to TappMCP WebSocket');
};

// Handle messages
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);

    // Update visualizations based on data type
    switch(data.type) {
        case 'performance_metrics':
            updatePerformanceChart(data.data);
            break;
        case 'workflow_status_update':
            updateWorkflowGraph(data.data);
            break;
    }
};

// Handle errors
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Handle disconnection
ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Attempt to reconnect
    setTimeout(() => {
        connectWebSocket();
    }, 3000);
};
```

## API Usage

### REST API Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Get Metrics
```bash
curl http://localhost:3000/metrics
```

#### List Tools
```bash
curl http://localhost:3000/tools
```

#### Use Smart Vibe
```bash
curl -X POST http://localhost:3000/tools/smart_vibe \
  -H "Content-Type: application/json" \
  -d '{"command": "create a React component"}'
```

### JavaScript API
```javascript
// Fetch system metrics
async function getMetrics() {
    const response = await fetch('/metrics');
    const data = await response.json();
    return data;
}

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
    const data = await response.json();
    return data;
}

// Get workflow data
async function getWorkflowData() {
    const response = await fetch('/api/visualizations/workflow');
    const data = await response.json();
    return data;
}
```

## Troubleshooting

### Common Issues

#### 1. Dashboard Not Loading
**Symptoms**: Blank page or error message
**Solutions**:
- Check if server is running: `curl http://localhost:3000/health`
- Verify port 3000 is available
- Check browser console for errors
- Try refreshing the page

#### 2. Visualizations Not Updating
**Symptoms**: Charts show static data or "Demo Data Mode"
**Solutions**:
- Check WebSocket connection status
- Verify server is broadcasting data
- Check browser WebSocket support
- Try reconnecting

#### 3. Smart Vibe Not Working
**Symptoms**: Commands not recognized or no response
**Solutions**:
- Check server logs for errors
- Verify tool is available: `curl http://localhost:3000/tools`
- Check network connectivity
- Try restarting the server

#### 4. Performance Issues
**Symptoms**: Slow loading or high CPU usage
**Solutions**:
- Check system resources
- Reduce data update frequency
- Close unnecessary browser tabs
- Check for memory leaks

### Debug Mode
Enable debug logging to troubleshoot issues:
```bash
# Set debug environment variable
export DEBUG=tappmcp:*

# Start server with debug logging
npm start
```

### Getting Help
- **Documentation**: Check this user guide and API docs
- **Logs**: Review server and browser console logs
- **Community**: Join the TappMCP Discord server
- **Issues**: Report bugs on GitHub

## Advanced Features

### Custom Visualizations
Create custom D3.js visualizations by extending the existing components:

```javascript
// Custom visualization component
const CustomChart = () => {
    const svgRef = React.useRef(null);
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        // D3.js rendering logic
        const svg = d3.select(svgRef.current);
        // ... your custom visualization code
    }, [data]);

    return <svg ref={svgRef} width="100%" height="400" />;
};
```

### Data Export
Export visualization data in various formats:
- **CSV**: For spreadsheet analysis
- **JSON**: For programmatic processing
- **PNG**: For reports and presentations
- **SVG**: For scalable graphics

### Filtering and Search
Use advanced filtering options:
- **Time Range**: Custom date ranges
- **Status Filters**: Multiple status selection
- **Metric Selection**: Choose specific metrics
- **Search**: Find specific workflows or events

### Integration Examples
Integrate TappMCP with other tools:

```javascript
// Slack integration
function sendToSlack(message) {
    // Send TappMCP data to Slack
}

// Email notifications
function sendEmailAlert(alert) {
    // Send alerts via email
}

// Database logging
function logToDatabase(data) {
    // Store metrics in database
}
```

## Best Practices

### Performance
- Use appropriate time ranges for data queries
- Limit the number of concurrent visualizations
- Enable caching for frequently accessed data
- Monitor memory usage and clean up resources

### Security
- Use HTTPS in production environments
- Implement proper authentication and authorization
- Validate all input data
- Keep dependencies updated

### Monitoring
- Set up health checks and alerts
- Monitor system performance metrics
- Track error rates and response times
- Maintain logs for troubleshooting

### Development
- Follow coding standards and best practices
- Write comprehensive tests
- Document your code and configurations
- Use version control for all changes

## Support

### Resources
- **Documentation**: [TappMCP Docs](./README.md)
- **API Reference**: [API Documentation](./API_DOCUMENTATION.md)
- **Deployment Guide**: [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- **D3.js Guide**: [D3.js Visualizations Guide](./D3_VISUALIZATIONS_GUIDE.md)

### Community
- **GitHub**: [TappMCP Repository](https://github.com/your-org/TappMCP)
- **Discord**: [TappMCP Community](https://discord.gg/tappmcp)
- **Issues**: [GitHub Issues](https://github.com/your-org/TappMCP/issues)

### Professional Support
For enterprise support and custom implementations:
- **Email**: support@tappmcp.com
- **Phone**: +1 (555) 123-4567
- **Documentation**: [Enterprise Guide](./ENTERPRISE_GUIDE.md)

## Changelog

### v1.0.0 (2025-01-14)
- Initial user guide release
- Complete dashboard documentation
- D3.js visualizations guide
- Smart Vibe tools documentation
- WebSocket integration guide
- API usage examples
- Troubleshooting section
- Advanced features documentation
