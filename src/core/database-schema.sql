-- TappMCP Hybrid SQLite + JSON Database Schema
-- Version: 1.0.0
-- Date: January 16, 2025

-- Enable WAL mode for better concurrency
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456; -- 256MB mmap

-- Main artifacts table with JSON file pointers
CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'context7', 'user_prefs', 'metrics', 'templates'
    category TEXT NOT NULL, -- 'knowledge', 'preferences', 'analytics'
    title TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Pointer to JSON file
    file_offset INTEGER, -- Byte offset for large files
    file_size INTEGER, -- Size of the data chunk
    metadata JSON, -- Lightweight metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    last_accessed DATETIME,
    priority INTEGER DEFAULT 0, -- For LRU-like behavior
    tags TEXT, -- Comma-separated tags
    compressed BOOLEAN DEFAULT 0,
    checksum TEXT -- File integrity check
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
CREATE INDEX IF NOT EXISTS idx_artifacts_priority ON artifacts(priority DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_last_accessed ON artifacts(last_accessed DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_tags ON artifacts(tags);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON artifacts(created_at DESC);

-- Lessons learned table
CREATE TABLE IF NOT EXISTS lessons_learned (
    id TEXT PRIMARY KEY,
    artifact_id TEXT REFERENCES artifacts(id),
    lesson_type TEXT NOT NULL, -- 'performance', 'error', 'optimization', 'pattern'
    title TEXT NOT NULL,
    description TEXT,
    context JSON, -- When/where this lesson was learned
    impact_score REAL, -- 0.0 to 1.0
    frequency INTEGER DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT 0,
    tags TEXT
);

-- Indexes for lessons learned
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons_learned(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_impact ON lessons_learned(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_frequency ON lessons_learned(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_resolved ON lessons_learned(resolved);

-- Data collection analytics
CREATE TABLE IF NOT EXISTS data_collection (
    id TEXT PRIMARY KEY,
    collection_type TEXT NOT NULL, -- 'usage', 'performance', 'errors', 'patterns'
    data JSON NOT NULL,
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT 0,
    insights JSON -- Generated insights
);

-- Indexes for data collection
CREATE INDEX IF NOT EXISTS idx_data_type ON data_collection(collection_type);
CREATE INDEX IF NOT EXISTS idx_data_collected_at ON data_collection(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_processed ON data_collection(processed);

-- Cache statistics table
CREATE TABLE IF NOT EXISTS cache_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    hit_rate REAL,
    miss_rate REAL,
    total_requests INTEGER,
    memory_usage INTEGER,
    cache_size INTEGER,
    average_response_time REAL
);

-- Index for cache stats
CREATE INDEX IF NOT EXISTS idx_cache_stats_timestamp ON cache_stats(timestamp DESC);

-- Database version tracking
CREATE TABLE IF NOT EXISTS db_version (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Insert initial version
INSERT OR IGNORE INTO db_version (version, description)
VALUES ('1.0.0', 'Initial hybrid SQLite + JSON architecture');

-- Views for common queries
CREATE VIEW IF NOT EXISTS artifact_summary AS
SELECT
    type,
    category,
    COUNT(*) as count,
    SUM(file_size) as total_size,
    AVG(access_count) as avg_access,
    MAX(last_accessed) as last_access
FROM artifacts
GROUP BY type, category;

CREATE VIEW IF NOT EXISTS performance_insights AS
SELECT
    ll.lesson_type,
    COUNT(*) as frequency,
    AVG(ll.impact_score) as avg_impact,
    GROUP_CONCAT(DISTINCT ll.title) as examples
FROM lessons_learned ll
WHERE ll.resolved = 0
GROUP BY ll.lesson_type
ORDER BY frequency DESC, avg_impact DESC;

-- Triggers for automatic updates
CREATE TRIGGER IF NOT EXISTS update_artifacts_timestamp
AFTER UPDATE ON artifacts
BEGIN
    UPDATE artifacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_artifacts_access
AFTER UPDATE OF access_count ON artifacts
BEGIN
    UPDATE artifacts SET last_accessed = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
