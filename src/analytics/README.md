# Call Tree Analytics System

Comprehensive analytics system for smart_vibe call tree capture, performance analysis, and optimization insights.

## 🚀 Quick Start

### Basic Usage

```typescript
import { VibeTappAnalyticsIntegration } from './VibeTappAnalyticsIntegration.js';
import { VibeTapp } from '../vibe/core/VibeTapp.js';

// Create VibeTapp with analytics
const vibeTapp = new VibeTapp();
const analytics = new VibeTappAnalyticsIntegration(vibeTapp, {
  enabled: true,
  storage: {
    backend: 'sqlite',
    retentionDays: 30
  },
  realTime: {
    enabled: true,
    processingInterval: 1000
  }
});

await analytics.initialize();

// Use with analytics
const response = await analytics.vibe('create a React todo app', {
  role: 'developer',
  quality: 'enterprise',
  trace: true
});

// Get analytics data
const analyticsData = (response as any).analytics;
console.log('Execution time:', analyticsData.executionMetrics.averageExecutionTime);
console.log('Success rate:', analyticsData.executionMetrics.successRate);
```

### Advanced Usage

```typescript
import {
  EnhancedCallTreeTracer,
  AnalyticsEngine,
  RealTimeProcessor,
  SQLiteTraceStorage
} from './index.js';

// Create storage backend
const storage = new SQLiteTraceStorage({
  backend: 'sqlite',
  connectionString: './data/analytics.db',
  retentionDays: 30
});
await storage.initialize();

// Create analytics engine
const analyticsEngine = new AnalyticsEngine({
  enableRealTime: true,
  performanceThresholds: {
    responseTime: 1000,
    errorRate: 0.05,
    memoryUsage: 0.8
  }
}, storage);

// Create real-time processor
const realTimeProcessor = new RealTimeProcessor({
  processingInterval: 1000,
  enableAlerts: true
}, storage);

realTimeProcessor.start();

// Create enhanced tracer
const tracer = new EnhancedCallTreeTracer({
  enabled: true,
  enableAnalytics: true,
  storageBackend: storage,
  enablePerformanceMonitoring: true
});

// Use tracer
await tracer.startEnhancedTrace('create app', {}, {});
tracer.addToolCall('smart_begin', {}, 100, true);
const analytics = await tracer.endEnhancedTrace();
```

## 📊 Analytics Features

### Execution Metrics
- **Response Time**: Average and peak execution times
- **Success Rate**: Percentage of successful operations
- **Tool Usage**: Distribution of tool usage patterns
- **Resource Usage**: Memory and CPU utilization
- **Cache Performance**: Hit rates and efficiency

### Performance Insights
- **Bottleneck Detection**: Identify slow operations
- **Optimization Opportunities**: Actionable recommendations
- **Resource Analysis**: Memory and CPU usage patterns
- **Scalability Metrics**: Performance under load

### Real-Time Monitoring
- **Live Metrics**: Real-time performance data
- **Alerting**: Configurable performance alerts
- **Health Scoring**: Overall system health assessment
- **Trend Analysis**: Performance trends over time

## 🗄️ Storage Backends

### SQLite (Default)
```typescript
const storage = new SQLiteTraceStorage({
  backend: 'sqlite',
  connectionString: './data/analytics.db',
  retentionDays: 30,
  compression: true
});
```

### PostgreSQL (Production)
```typescript
const storage = new PostgreSQLTraceStorage({
  backend: 'postgresql',
  connectionString: 'postgresql://user:pass@localhost:5432/analytics',
  retentionDays: 90
});
```

### JSON Files (Development)
```typescript
const storage = new JSONFileTraceStorage({
  backend: 'json',
  connectionString: './data/analytics.json',
  retentionDays: 7
});
```

## 📈 Dashboard Integration

### Live Metrics
```typescript
const liveMetrics = analyticsIntegration.getLiveMetrics();
console.log('Request rate:', liveMetrics.requestRate);
console.log('Health score:', liveMetrics.healthScore);
```

### Performance Trends
```typescript
const trends = analyticsIntegration.getPerformanceTrends();
console.log('Response time trend:', trends.responseTime);
console.log('Error rate trend:', trends.errorRate);
```

### Usage Patterns
```typescript
const patterns = analyticsIntegration.getUsagePatterns();
patterns.forEach(pattern => {
  console.log('Pattern:', pattern.description);
  console.log('Confidence:', pattern.confidence);
});
```

### Optimization Opportunities
```typescript
const opportunities = await analyticsIntegration.getOptimizationOpportunities();
opportunities.forEach(opp => {
  console.log('Opportunity:', opp.description);
  console.log('Expected improvement:', opp.expectedImprovement + '%');
});
```

## 🔧 Configuration

### Analytics Configuration
```typescript
const config = {
  enabled: true,
  storage: {
    backend: 'sqlite',
    connectionString: './data/analytics.db',
    retentionDays: 30
  },
  realTime: {
    enabled: true,
    processingInterval: 1000,
    enableAlerts: true
  },
  performance: {
    enabled: true,
    samplingRate: 1.0,
    alertThresholds: {
      responseTime: 1000,
      errorRate: 0.05,
      memoryUsage: 0.8
    }
  }
};
```

### Tracer Configuration
```typescript
const tracerConfig = {
  enabled: true,
  level: 'detailed',
  includeParameters: true,
  includeResults: true,
  includeTiming: true,
  includeContext7: true,
  includeCache: true,
  enableAnalytics: true,
  enableRealTime: true,
  samplingRate: 1.0,
  enablePerformanceMonitoring: true,
  enableUsagePatterns: true
};
```

## 🧪 Testing

### Run Tests
```bash
npm test src/analytics/__tests__/
```

### Performance Tests
```bash
npm test src/analytics/__tests__/PerformanceValidation.test.ts
```

### Test Coverage
```bash
npm run test:coverage -- src/analytics/
```

## 📝 API Reference

### VibeTappAnalyticsIntegration

#### Methods
- `initialize()`: Initialize analytics system
- `vibe(input, options)`: Execute vibe command with analytics
- `getRecentAnalytics(count)`: Get recent analytics data
- `getLiveMetrics()`: Get current live metrics
- `getOptimizationOpportunities()`: Get optimization recommendations
- `getPerformanceTrends()`: Get performance trend data
- `getUsagePatterns()`: Get detected usage patterns
- `getActiveAlerts()`: Get current active alerts
- `stop()`: Stop analytics processing

### EnhancedCallTreeTracer

#### Methods
- `startEnhancedTrace(command, options, context)`: Start enhanced trace
- `endEnhancedTrace()`: End trace and generate analytics
- `addToolCall(tool, parameters, executionTime, success, result, error)`: Track tool call
- `addContext7Call(operation, endpoint, parameters, responseTime, success, responseSize, cacheHit, tokenUsage, cost)`: Track Context7 call
- `addCacheOperation(operation, key, operationTime, success, dataSize, hit)`: Track cache operation
- `recordPerformanceMetric(name, value, unit, tags)`: Record performance metric
- `recordError(message, type, stack, context)`: Record error
- `recordUserPattern(type, data, confidence)`: Record usage pattern

### AnalyticsEngine

#### Methods
- `processTrace(trace)`: Process single trace
- `processTraces(traces)`: Process multiple traces
- `getAnalyticsForTimeRange(startTime, endTime)`: Get analytics for time range
- `getOptimizationRecommendations()`: Get optimization recommendations

### RealTimeProcessor

#### Methods
- `start()`: Start real-time processing
- `stop()`: Stop real-time processing
- `processTrace(trace)`: Process trace in real-time
- `getLiveMetrics()`: Get current live metrics
- `getActiveAlerts()`: Get active alerts
- `getPerformanceTrends()`: Get performance trends
- `getUsagePatterns()`: Get usage patterns
- `getOptimizationOpportunities()`: Get optimization opportunities

## 🚨 Troubleshooting

### Common Issues

1. **Storage Initialization Failed**
   - Check database connection string
   - Ensure directory permissions
   - Verify SQLite installation

2. **Performance Impact**
   - Reduce sampling rate
   - Disable real-time processing
   - Use in-memory storage for testing

3. **Memory Usage**
   - Reduce retention period
   - Enable data compression
   - Use external storage backend

### Debug Mode

```typescript
const analytics = new VibeTappAnalyticsIntegration(vibeTapp, {
  enabled: true,
  realTime: {
    enabled: true,
    processingInterval: 1000,
    enableAlerts: true
  }
});

// Enable debug logging
console.log('Analytics status:', analytics.getAnalyticsStatus());
```

## 📚 Examples

See `src/analytics/examples/` for complete integration examples.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Ensure performance impact is minimal
5. Follow existing code style

## 📄 License

Part of TappMCP project - see main project license.
