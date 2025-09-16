# TappMCP Database Architecture Documentation

**Date**: January 16, 2025
**Version**: 2.0.0
**Status**: ✅ **CURRENT ARCHITECTURE**

---

## 🎯 **Executive Summary**

TappMCP uses a **file-based storage system** with **in-memory caching** instead of traditional databases. This architecture provides simplicity, performance, and zero infrastructure overhead.

---

## 📊 **Current Architecture**

### **❌ NO Traditional Database**
TappMCP does **NOT** use any traditional database systems:
- ❌ PostgreSQL, MySQL, MongoDB, SQLite
- ❌ No database dependencies in package.json
- ❌ No database connection strings or configurations
- ❌ No ORM or database drivers

### **✅ File-Based Storage System**

#### **1. JSON File Storage**
```typescript
// Primary data persistence
const cacheFile = './cache/context7-cache.json';
const userPrefsFile = './data/user-preferences.json';
const metricsFile = './logs/metrics.json';
```

**Files Used:**
- `./cache/context7-cache.json` - Context7 API responses
- `./data/user-preferences.json` - User settings and preferences
- `./logs/metrics.json` - Performance metrics and analytics
- Various configuration files

#### **2. In-Memory LRU Caching**
```typescript
// High-performance temporary storage
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 1000,           // 1000 items
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  updateAgeOnGet: true
});
```

**Cache Instances:**
- `ResponseCacheLRU` - MCP tool responses
- `Context7Cache` - External API responses
- `PerformanceCache` - Code analysis results
- `QualityCache` - Quality metrics
- Multiple specialized caches

#### **3. File System Operations**
```typescript
// Data persistence patterns
import fs from 'fs/promises';
import { JSON } from 'json';

// Read data
const data = JSON.parse(await fs.readFile(file, 'utf8'));

// Write data
await fs.writeFile(file, JSON.stringify(data, null, 2));
```

**Usage:** 322+ file operations across 74 files

---

## 🗂️ **Data Storage Patterns**

| Data Type | Storage Method | Persistence | Performance |
|-----------|----------------|-------------|-------------|
| **Context7 Cache** | JSON file + LRU cache | ✅ Persistent | ⚡ Fast |
| **User Preferences** | JSON file | ✅ Persistent | ⚡ Fast |
| **Metrics/Logs** | JSON file | ✅ Persistent | ⚡ Fast |
| **Templates** | In-memory + file | ⚠️ Partial | ⚡ Fast |
| **Session Data** | LRU cache only | ❌ Not persistent | ⚡ Fast |
| **Tool Responses** | LRU cache only | ❌ Not persistent | ⚡ Fast |

---

## 🔧 **Database Intelligence Tools (Not Actual DB)**

TappMCP includes **database analysis tools** but doesn't use a database:

### **Analysis Engines**
- `DatabaseIntelligenceEngine` - Analyzes code for database patterns
- `DatabaseResource` - Simulates database operations
- `QueryOptimizer` - Suggests database optimizations
- `DataIntegrityAnalyzer` - Validates data relationships

### **Purpose**
These tools help developers:
- Analyze existing database code
- Suggest database optimizations
- Generate database schemas
- Validate data integrity patterns

**Note:** These are **analysis tools**, not actual database usage.

---

## 📈 **Architecture Benefits**

### **✅ Advantages**
- **Zero Infrastructure** - No database server needed
- **Simple Deployment** - Just files and Node.js
- **High Performance** - In-memory caching
- **Easy Debugging** - Human-readable JSON files
- **Cost Effective** - No database licensing
- **Fast Startup** - No connection overhead

### **⚠️ Limitations**
- **Single Instance** - No multi-user scaling
- **Memory Bound** - Limited by Node.js heap
- **No ACID** - No transaction guarantees
- **File Locking** - Potential concurrency issues
- **Backup Complexity** - Manual file management

---

## 🚀 **Performance Characteristics**

### **Cache Performance**
- **Hit Rate**: 60-80% typical
- **Response Time**: <1ms for cache hits
- **Memory Usage**: ~50MB for 1000 items
- **TTL**: 24 hours default

### **File I/O Performance**
- **Read Time**: 1-5ms for JSON files
- **Write Time**: 2-10ms for JSON files
- **Concurrent Access**: Limited by file system

---

## 🔄 **Data Flow**

```
User Request
    ↓
LRU Cache Check
    ↓ (miss)
File System Read
    ↓
Process Data
    ↓
Update Cache
    ↓
Return Response
```

---

## 🛠️ **Maintenance**

### **Cache Management**
- Automatic LRU eviction
- TTL-based expiration
- Memory usage monitoring
- Health check endpoints

### **File Management**
- JSON file validation
- Backup strategies
- Cleanup procedures
- Error handling

---

## 📋 **Configuration**

### **Cache Settings**
```typescript
const defaultCacheConfig = {
  maxSize: 1000,           // Max items
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  updateAgeOnGet: true,    // Update access time
  allowStale: false        // Don't return expired
};
```

### **File Paths**
```typescript
const paths = {
  cache: './cache/',
  data: './data/',
  logs: './logs/',
  temp: './tmp/'
};
```

---

## 🎯 **Recommendations**

### **Current State: Good for**
- Single-user applications
- Development tools
- Prototype systems
- Low-latency requirements

### **Consider Database When**
- Multi-user scaling needed
- ACID transactions required
- Complex queries needed
- Data integrity critical

---

## 📚 **Related Files**

- `src/core/response-cache-lru.ts` - Main caching system
- `src/core/context7-cache.ts` - Context7 API caching
- `src/brokers/context7-broker.ts` - File-based persistence
- `src/resources/database-resource.ts` - Database simulation
- `package.json` - Dependencies (no database packages)

---

**Last Updated**: January 16, 2025
**Next Review**: When scaling requirements change

---

*This document prevents confusion about TappMCP's storage architecture and helps with future development decisions.*
