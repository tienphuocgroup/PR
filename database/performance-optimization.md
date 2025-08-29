# TPG Payment Request System - Database Performance Optimization Guide

## Overview
This document provides comprehensive performance optimization recommendations for the TPG Payment Request System database, with focus on Vietnamese financial compliance requirements and AI integration capabilities.

## Database Configuration Optimization

### SQLite Configuration
```sql
-- Optimal SQLite settings for the application
PRAGMA foreign_keys = ON;           -- Enforce referential integrity
PRAGMA encoding = 'UTF-8';          -- Vietnamese character support
PRAGMA journal_mode = WAL;          -- Write-Ahead Logging for better concurrency
PRAGMA synchronous = NORMAL;        -- Balance between safety and performance
PRAGMA cache_size = 10000;          -- 10MB cache (adjust based on available memory)
PRAGMA temp_store = MEMORY;         -- Store temporary tables in memory
PRAGMA mmap_size = 67108864;        -- 64MB memory-mapped I/O
PRAGMA page_size = 4096;            -- Optimal page size for most systems
PRAGMA wal_autocheckpoint = 1000;   -- Checkpoint WAL every 1000 pages
```

### Connection Pool Settings (Application Level)
```javascript
// Recommended connection pool configuration
const dbConfig = {
  // Maximum number of connections
  max: 5,
  // Minimum number of connections
  min: 1,
  // Maximum time to wait for a connection (ms)
  acquireTimeoutMillis: 30000,
  // Time before closing idle connections (ms)
  idleTimeoutMillis: 600000,
  // Enable WAL mode
  mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  // Enable foreign keys
  foreign_keys: true
};
```

## Indexing Strategy

### Primary Indexes (Already Implemented)
The schema includes optimized indexes for:
- Primary keys (automatic B-tree indexes)
- Foreign keys for referential integrity
- Unique constraints for business rules

### Query-Specific Indexes
```sql
-- High-performance indexes for common query patterns

-- Payment request filtering and search
CREATE INDEX idx_pr_status_priority_created ON payment_requests(status, priority, created_at DESC);
CREATE INDEX idx_pr_amount_range ON payment_requests(so_tien) WHERE deleted_at IS NULL;
CREATE INDEX idx_pr_department_year ON payment_requests(bo_phan, strftime('%Y', ngay));
CREATE INDEX idx_pr_supplier_status ON payment_requests(nha_cung_cap, status) WHERE deleted_at IS NULL;

-- Date-based reporting indexes
CREATE INDEX idx_pr_ngay_year_month ON payment_requests(strftime('%Y-%m', ngay), status);
CREATE INDEX idx_pr_due_date_status ON payment_requests(ngay_den_han, status) WHERE status NOT IN ('paid', 'cancelled');

-- Approval workflow indexes
CREATE INDEX idx_pr_approval_queue ON payment_requests(status, priority, created_at) WHERE status = 'submitted';
CREATE INDEX idx_pr_overdue ON payment_requests(ngay_den_han) WHERE status IN ('approved', 'submitted') AND ngay_den_han < date('now');

-- AI and analytics indexes
CREATE INDEX idx_embeddings_type_model ON embeddings(embedding_type, model_name);
CREATE INDEX idx_ai_insights_confidence_desc ON ai_insights(insight_type, confidence_score DESC);
CREATE INDEX idx_training_data_quality ON ml_training_data(data_type, data_quality_score DESC) WHERE is_validated = 1;

-- Audit and compliance indexes
CREATE INDEX idx_audit_timestamp_table ON audit_logs(created_at DESC, table_name);
CREATE INDEX idx_workflow_recent ON workflow_history(created_at DESC) WHERE created_at > datetime('now', '-30 days');
```

### Partial Indexes for Improved Performance
```sql
-- Indexes only on active records to improve performance
CREATE INDEX idx_active_payments ON payment_requests(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_pending_approvals ON payment_requests(created_at DESC) WHERE status = 'submitted';
CREATE INDEX idx_overdue_payments ON payment_requests(ngay_den_han DESC) WHERE status IN ('approved') AND ngay_den_han < date('now');

-- Supplier performance tracking
CREATE INDEX idx_supplier_active_transactions ON payment_requests(nha_cung_cap, status) WHERE status IN ('approved', 'paid');
```

## Query Optimization Patterns

### Efficient Filtering Queries
```sql
-- Good: Use indexed columns in WHERE clause
SELECT * FROM payment_requests 
WHERE status = 'submitted' 
AND priority = 'high' 
AND created_at >= date('now', '-7 days')
ORDER BY created_at DESC;

-- Better: Include additional filters to use composite indexes
SELECT * FROM payment_requests 
WHERE status = 'submitted' 
AND bo_phan = 'Tài chính kế toán'
AND created_at >= date('now', '-30 days')
ORDER BY created_at DESC
LIMIT 50;
```

### Optimized Aggregation Queries
```sql
-- Department spending summary with proper indexing
SELECT 
    bo_phan,
    COUNT(*) as total_requests,
    SUM(so_tien) as total_amount,
    AVG(so_tien) as average_amount
FROM payment_requests 
WHERE deleted_at IS NULL 
AND ngay >= date('now', 'start of year')
GROUP BY bo_phan
ORDER BY total_amount DESC;

-- Monthly trends with date functions
SELECT 
    strftime('%Y-%m', ngay) as month,
    COUNT(*) as request_count,
    SUM(so_tien) as total_amount
FROM payment_requests 
WHERE deleted_at IS NULL 
AND ngay >= date('now', '-12 months')
GROUP BY strftime('%Y-%m', ngay)
ORDER BY month DESC;
```

### Full-Text Search Optimization
```sql
-- Efficient FTS queries
SELECT pr.*, ts.rank
FROM payment_requests pr
JOIN payment_requests_fts ts ON pr.rowid = ts.rowid
WHERE payment_requests_fts MATCH 'thiết bị'
AND pr.deleted_at IS NULL
ORDER BY ts.rank
LIMIT 20;

-- Combined FTS and filter queries
SELECT pr.*, ts.rank
FROM payment_requests pr
JOIN payment_requests_fts ts ON pr.rowid = ts.rowid
WHERE payment_requests_fts MATCH 'máy tính'
AND pr.status IN ('submitted', 'approved')
AND pr.so_tien >= 1000000
ORDER BY ts.rank, pr.created_at DESC
LIMIT 50;
```

## Memory Management

### Buffer Pool Optimization
```sql
-- Analyze table statistics for optimal query planning
ANALYZE main.payment_requests;
ANALYZE main.payment_details;
ANALYZE main.suppliers;
ANALYZE main.audit_logs;

-- Optimize cache usage
PRAGMA optimize; -- Run periodically to update statistics
```

### Large Dataset Handling
```sql
-- Pagination for large result sets
SELECT * FROM payment_requests
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50 OFFSET ?;

-- Cursor-based pagination (more efficient for large offsets)
SELECT * FROM payment_requests
WHERE deleted_at IS NULL
AND created_at < ?  -- Last seen timestamp
ORDER BY created_at DESC
LIMIT 50;
```

## Data Archival Strategy

### Automated Archival Process
```sql
-- Create archive tables
CREATE TABLE archived_payment_requests AS 
SELECT * FROM payment_requests WHERE 1=0; -- Empty copy of structure

CREATE TABLE archived_payment_details AS 
SELECT * FROM payment_details WHERE 1=0;

-- Archive old completed payments (older than 2 years)
INSERT INTO archived_payment_requests
SELECT * FROM payment_requests 
WHERE status IN ('paid', 'cancelled')
AND updated_at < date('now', '-2 years');

-- Remove archived data from main tables
DELETE FROM payment_requests 
WHERE id IN (SELECT id FROM archived_payment_requests);
```

### Soft Delete Cleanup
```sql
-- Clean up soft-deleted records older than retention period
DELETE FROM payment_requests 
WHERE deleted_at IS NOT NULL 
AND deleted_at < date('now', '-3 years');

-- Clean up old audit logs (keep 7 years for compliance)
DELETE FROM audit_logs 
WHERE created_at < date('now', '-7 years');
```

## Backup and Recovery Optimization

### High-Performance Backup Strategy
```bash
#!/bin/bash
# backup-database.sh - Optimized backup script

DB_PATH="./database/tpg_payment_system.db"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Hot backup using SQLite backup API (no downtime)
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/tpg_payment_$DATE.db'"

# Compress backup
gzip "$BACKUP_DIR/tpg_payment_$DATE.db"

# Verify backup integrity
sqlite3 "$BACKUP_DIR/tpg_payment_$DATE.db" "PRAGMA integrity_check;"

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/tpg_payment_$DATE.db.gz"
```

### Recovery Procedures
```sql
-- Database integrity check
PRAGMA integrity_check;

-- Fix minor corruption if detected
PRAGMA wal_checkpoint(FULL);
VACUUM;
REINDEX;

-- Complete database rebuild if needed
CREATE TABLE temp_payment_requests AS SELECT * FROM payment_requests;
DROP TABLE payment_requests;
-- Recreate table from schema
INSERT INTO payment_requests SELECT * FROM temp_payment_requests;
DROP TABLE temp_payment_requests;
```

## Monitoring and Maintenance

### Performance Monitoring Queries
```sql
-- Query to identify slow operations
CREATE VIEW v_performance_monitor AS
SELECT 
    'Payment Requests' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_records,
    MAX(created_at) as last_insert,
    MAX(updated_at) as last_update
FROM payment_requests
UNION ALL
SELECT 
    'Payment Details' as table_name,
    COUNT(*) as total_records,
    COUNT(*) as active_records,
    MAX(created_at) as last_insert,
    MAX(updated_at) as last_update
FROM payment_details;

-- Index usage statistics
.schema --indent sqlite_stat1  -- Shows index usage statistics
```

### Maintenance Schedule
```sql
-- Daily maintenance (automated)
PRAGMA optimize;
PRAGMA wal_checkpoint(TRUNCATE);

-- Weekly maintenance
ANALYZE;
UPDATE system_settings 
SET setting_value = datetime('now') 
WHERE setting_key = 'last_maintenance_run';

-- Monthly maintenance
VACUUM; -- Rebuilds database, reclaims space
REINDEX; -- Rebuilds all indexes

-- Quarterly maintenance
-- Run data archival scripts
-- Review and optimize query performance
-- Update database statistics
```

## Application-Level Optimizations

### Connection Management
```javascript
// Efficient connection pooling
class DatabasePool {
  constructor() {
    this.pool = new Pool({
      max: 5,
      min: 1,
      createRetryIntervalMillis: 200,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 600000
    });
  }
  
  async query(sql, params) {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }
}
```

### Caching Strategy
```javascript
// Redis caching for frequent queries
const cacheConfig = {
  // Cache department list (changes infrequently)
  departments: { ttl: 3600 }, // 1 hour
  
  // Cache supplier list (changes infrequently)  
  suppliers: { ttl: 1800 }, // 30 minutes
  
  // Cache user sessions
  sessions: { ttl: 28800 }, // 8 hours
  
  // Cache dashboard data
  dashboard: { ttl: 300 }, // 5 minutes
  
  // Cache search results
  search: { ttl: 600 } // 10 minutes
};
```

### Batch Operations
```javascript
// Bulk insert for performance
async function bulkInsertPaymentDetails(paymentRequestId, details) {
  const placeholders = details.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
  const values = details.flatMap(detail => [
    paymentRequestId, detail.stt, detail.dienGiai, 
    detail.soLuong, detail.donVi, detail.donGia, detail.thanhTien
  ]);
  
  const sql = `
    INSERT INTO payment_details 
    (payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien)
    VALUES ${placeholders}
  `;
  
  return await db.query(sql, values);
}
```

## Specific Optimizations for Vietnamese Financial Data

### Currency and Number Handling
```sql
-- Optimized currency calculations with proper precision
CREATE INDEX idx_amount_calculations ON payment_requests(
  CAST(so_tien AS INTEGER) -- Index on integer part for range queries
);

-- Vietnamese dong amount ranges for reporting
CREATE INDEX idx_amount_ranges ON payment_requests(
  CASE 
    WHEN so_tien < 1000000 THEN 'under_1m'
    WHEN so_tien < 10000000 THEN '1m_to_10m'
    WHEN so_tien < 100000000 THEN '10m_to_100m'
    ELSE 'over_100m'
  END
) WHERE deleted_at IS NULL;
```

### Vietnamese Text Search Optimization
```sql
-- Optimize for Vietnamese search patterns
CREATE INDEX idx_vietnamese_search ON payment_requests(
  lower(noi_dung_thanh_toan),
  lower(nha_cung_cap)
) WHERE deleted_at IS NULL;

-- Support for Vietnamese company name variations
CREATE INDEX idx_supplier_normalized ON suppliers(
  lower(replace(replace(name, 'Công ty', ''), 'TNHH', ''))
);
```

## Expected Performance Metrics

### Target Performance Goals
- **Query Response Time**: < 100ms for typical queries
- **Search Response Time**: < 200ms for full-text search
- **Report Generation**: < 2s for monthly reports
- **Bulk Operations**: > 1000 records/second for imports
- **Database Size**: Optimized for up to 1M payment requests
- **Concurrent Users**: Support 20+ concurrent users

### Monitoring Thresholds
```sql
-- Performance monitoring alerts
CREATE VIEW v_performance_alerts AS
SELECT
  'Slow queries detected' as alert_type,
  COUNT(*) as count
FROM sqlite_master -- This would be replaced with actual slow query log
WHERE 1=0 -- Placeholder
UNION ALL
SELECT
  'Large table scan detected' as alert_type,
  0 as count -- Implement actual monitoring
UNION ALL
SELECT
  'Index usage low' as alert_type,
  0 as count; -- Implement actual monitoring
```

## Troubleshooting Common Performance Issues

### Query Performance Issues
1. **Slow WHERE clauses**: Ensure proper indexing on filter columns
2. **Inefficient JOINs**: Use EXPLAIN QUERY PLAN to analyze
3. **Missing LIMIT clauses**: Always limit large result sets
4. **Inefficient ORDER BY**: Ensure indexed columns are used for sorting

### Database Growth Issues
1. **Large audit logs**: Implement automated cleanup
2. **Attachment storage**: Move files to separate storage system
3. **Deleted records**: Regular cleanup of soft-deleted data
4. **Index bloat**: Regular REINDEX maintenance

### Memory Usage Issues
1. **Cache size too small**: Increase PRAGMA cache_size
2. **Too many connections**: Implement proper connection pooling
3. **Large result sets**: Implement pagination
4. **Memory leaks**: Monitor application-level connection handling

This performance optimization guide ensures the TPG Payment Request System maintains excellent performance while handling Vietnamese financial data and compliance requirements efficiently.