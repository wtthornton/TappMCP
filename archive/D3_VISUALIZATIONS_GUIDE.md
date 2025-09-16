# 🎯 D3.js Visualizations Guide

## Overview
TappMCP includes a comprehensive D3.js visualization dashboard that provides interactive, real-time insights into system performance, workflow status, and operational metrics.

## 🌐 Access
**URL:** `http://localhost:3000/d3-visualizations.html`

## 📊 Available Visualizations

### 1. Interactive Workflow Graph
**Purpose:** Force-directed graph showing workflow nodes, connections, and real-time status updates.

**Features:**
- 🕸️ **Force Simulation** - Dynamic node positioning with physics simulation
- 🔍 **Zoom & Pan** - Interactive navigation with mouse and touch support
- 🖱️ **Drag & Drop** - Reposition nodes by dragging
- 🎨 **Status Colors** - Visual status indicators (completed, running, pending, failed)
- 📊 **Progress Rings** - Circular progress indicators for each node
- 🔗 **Connection Lines** - Dynamic connections between workflow steps

**Data Structure:**
```typescript
interface WorkflowNode {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  phase: string;
  progress: number; // 0-100
  x: number;
  y: number;
}

interface WorkflowConnection {
  source: string;
  target: string;
  type: 'sequence' | 'dependency' | 'data-flow';
}
```

**Filter Controls:**
- **Status Filter:** All Statuses, Completed, Running, Pending, Failed
- **Phase Filter:** All Phases, Initialization, Processing, Analysis, Validation, Finalization
- **Layout:** Force Directed, Grid Layout, Hierarchical

### 2. Performance Monitoring Charts
**Purpose:** Real-time system performance metrics including CPU usage, memory consumption, response times, and error rates.

**Features:**
- 📈 **Multi-line Charts** - CPU and memory usage over time
- 🎨 **Area Overlays** - Visual representation of performance trends
- 📊 **Interactive Legends** - Click to show/hide metrics
- ⚠️ **Alert Indicators** - Visual alerts for threshold breaches
- ⏰ **Time Range Selection** - 15m, 1h, 6h, 24h, 7d
- 📤 **Export Functionality** - CSV export for analysis

**Metrics Tracked:**
- **CPU Usage** - Percentage of CPU utilization
- **Memory Usage** - RAM consumption percentage
- **Response Time** - API response times in milliseconds
- **Error Rate** - Percentage of failed requests

**Filter Controls:**
- **Time Range:** 15m, 1h, 6h, 24h, 7d
- **Metrics Selection:** CPU, Memory, Response Time, Error Rate (multi-select)
- **Chart Type:** Line, Area, Bar

### 3. Value Dashboard
**Purpose:** Token tracking, cost savings, and quality metrics visualization.

**Features:**
- 💰 **Token Tracking** - Total tokens used and saved
- 💵 **Cost Analysis** - Cost savings and efficiency metrics
- 🐛 **Quality Metrics** - Bugs found and quality scores
- 📊 **Trend Analysis** - Performance over time
- 🎯 **Goal Tracking** - Progress toward targets

**Metrics Tracked:**
- **Total Tokens Used** - Cumulative token consumption
- **Total Tokens Saved** - Efficiency gains
- **Total Bugs Found** - Quality improvement metrics
- **Total Cost Savings** - Financial impact
- **Average Quality Score** - Overall quality rating

**Filter Controls:**
- **Time Range:** 1h, 6h, 24h, 7d, 30d
- **Metrics Filter:** All, Tokens, Cost, Quality, Bugs
- **Chart Type:** Line, Area, Bar, Scatter

### 4. Timeline View
**Purpose:** Gantt-style timeline of workflow events and duration tracking.

**Features:**
- ⏰ **Event Timeline** - Chronological view of workflow events
- 🎨 **Color Coding** - Different colors for event types
- 📏 **Duration Bars** - Visual representation of event duration
- 🔍 **Event Details** - Hover for detailed information
- 📅 **Time Navigation** - Navigate through different time periods

**Event Types:**
- **Data Collection** - Data gathering and preparation
- **Processing** - Data processing and transformation
- **Analysis** - Data analysis and insights
- **Validation** - Quality checks and validation
- **Reporting** - Report generation and delivery

**Filter Controls:**
- **Time Range:** 1h, 6h, 24h, 7d, 30d
- **Event Types:** All, Data, Process, Analysis, Validation, Report
- **View Type:** Gantt, Timeline, List

## 🔧 Technical Implementation

### WebSocket Integration
All visualizations receive real-time data via WebSocket connection:
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update visualizations with live data
};
```

### Data Transformation
Raw metrics are transformed for D3.js consumption:
```javascript
// Performance metrics transformation
const transformedData = rawData.map(item => ({
  timestamp: new Date(item.timestamp),
  cpu: item.cpuUsage,
  memory: item.memoryUsage,
  responseTime: item.avgResponseTime,
  errorRate: item.errorRate * 100
}));
```

### React Integration
Visualizations are built as React components with D3.js rendering:
```jsx
const WorkflowGraph = () => {
  const svgRef = React.useRef(null);
  const [data, setData] = React.useState({ nodes: [], connections: [] });

  React.useEffect(() => {
    // D3.js rendering logic
  }, [data]);

  return <svg ref={svgRef} width="100%" height="400" />;
};
```

## 🎨 Customization

### Styling
Visualizations use CSS custom properties for theming:
```css
:root {
  --primary-bg: #0a0a0a;
  --accent-color: #00ff88;
  --warning-color: #ffaa00;
  --error-color: #ff4444;
}
```

### Data Sources
Configure data sources in `LiveDataStore`:
```javascript
const LiveDataStore = {
  performanceMetrics: [],
  valueMetrics: [],
  workflowData: { nodes: [], connections: [] },
  timelineEvents: [],
  isConnected: false,
  lastUpdate: null
};
```

## 🚀 Getting Started

1. **Start the Server:**
   ```bash
   npm start
   ```

2. **Access Visualizations:**
   Open `http://localhost:3000/d3-visualizations.html`

3. **Enable Real-time Data:**
   Ensure WebSocket connection is active (green indicator)

4. **Customize Views:**
   Use filter controls to adjust time ranges and metrics

## 🔍 Troubleshooting

### Common Issues

**Visualizations Not Loading:**
- Check browser console for JavaScript errors
- Verify WebSocket connection status
- Ensure server is running on port 3000

**No Real-time Data:**
- Check WebSocket connection indicator
- Verify server is broadcasting metrics
- Check network connectivity

**Performance Issues:**
- Reduce data update frequency
- Limit number of data points displayed
- Check browser performance tools

### Debug Mode
Enable debug logging:
```javascript
console.log('D3.js Debug Mode Enabled');
// Add detailed logging to track data flow
```

## 📚 Additional Resources

- [D3.js Documentation](https://d3js.org/)
- [React Documentation](https://reactjs.org/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TappMCP API Documentation](./API_DOCUMENTATION.md)

## 🤝 Contributing

To add new visualizations:
1. Create React component in `public/d3-visualizations.html`
2. Add D3.js rendering logic
3. Implement WebSocket data integration
4. Add filter controls and export functionality
5. Update this documentation

## 📄 License

This visualization system is part of TappMCP and follows the same licensing terms.
