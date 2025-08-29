# TPG Payment Request System - Database Deployment Guide

## Overview
This comprehensive deployment guide covers local-first database setup for the TPG Payment Request System, designed for Vietnamese financial compliance and AI integration capabilities.

## Pre-Deployment Requirements

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16+ (recommended 18+ for optimal performance)
- **SQLite**: Version 3.35+ (included with Node.js sqlite3 package)
- **Memory**: Minimum 4GB RAM (8GB recommended for AI features)
- **Storage**: 10GB free space (5GB for database growth, 5GB for backups)
- **Network**: No internet required for core functionality (local-first)

### Required Node.js Packages
```json
{
  "dependencies": {
    "sqlite3": "^5.1.6",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "bcrypt": "^5.1.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "prisma-dbml-generator": "^0.10.0"
  }
}
```

## Deployment Steps

### Step 1: Environment Setup

Create environment configuration file:

```bash
# .env
DATABASE_URL="file:./database/tpg_payment_system.db"
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret_here
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800
ADMIN_PASSWORD=admin123_change_me
```

Create directory structure:
```bash
mkdir -p database
mkdir -p database/backups
mkdir -p database/migration
mkdir -p uploads
mkdir -p logs
```

### Step 2: Database Schema Creation

Execute the schema creation:
```bash
# Option 1: Using SQLite CLI
sqlite3 database/tpg_payment_system.db < database/schema.sql

# Option 2: Using Node.js script
node scripts/create-database.js
```

Create the database setup script:

```javascript
// scripts/create-database.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function createDatabase() {
  const dbPath = path.join(__dirname, '..', 'database', 'tpg_payment_system.db');
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  // Create database directory if it doesn't exist
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new sqlite3.Database(dbPath);
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating database schema:', err);
        reject(err);
      } else {
        console.log('Database schema created successfully');
        resolve();
      }
      db.close();
    });
  });
}

createDatabase().catch(console.error);
```

### Step 3: Database Initialization

Run initialization script:
```bash
sqlite3 database/tpg_payment_system.db < database/init.sql
```

### Step 4: Prisma Setup (Optional)

If using Prisma ORM:
```bash
# Generate Prisma client
npx prisma generate

# Apply database schema (if using Prisma migrations)
npx prisma db push

# View database in Prisma Studio (development only)
npx prisma studio
```

### Step 5: Load Sample Data (Development Only)

For development/testing environments:
```bash
sqlite3 database/tpg_payment_system.db < database/seed.sql
```

### Step 6: Application Configuration

Update application configuration:

```javascript
// config/database.js
const path = require('path');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '..', 'database', 'tpg_payment_system.db')
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 5
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '..', 'database', 'tpg_payment_system.db')
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 3
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

## Migration from Cookie Storage

### Automated Migration Script

Create migration runner:

```javascript
// scripts/migrate-from-cookies.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function runCookieMigration(cookieDataArray) {
  const dbPath = path.join(__dirname, '..', 'database', 'tpg_payment_system.db');
  const db = new sqlite3.Database(dbPath);
  
  console.log('Starting cookie to database migration...');
  
  // Insert cookie data into temp table
  const stmt = db.prepare('INSERT INTO temp_cookie_migration (cookie_data) VALUES (?)');
  
  for (const cookieData of cookieDataArray) {
    stmt.run(JSON.stringify(cookieData));
  }
  
  stmt.finalize();
  
  // Run migration SQL
  const migrationSQL = require('fs').readFileSync(
    path.join(__dirname, '..', 'database', 'migration', 'cookie-to-db-migration.sql'),
    'utf8'
  );
  
  return new Promise((resolve, reject) => {
    db.exec(migrationSQL, (err) => {
      if (err) {
        console.error('Migration failed:', err);
        reject(err);
      } else {
        console.log('Migration completed successfully');
        
        // Get migration summary
        db.get('SELECT * FROM v_migration_summary', (err, row) => {
          if (row) {
            console.log('Migration Summary:', row);
          }
          resolve(row);
        });
      }
    });
  });
}

module.exports = { runCookieMigration };
```

### Manual Migration Process

1. **Export existing cookie data** from browser:
```javascript
// Run in browser console to export existing data
const cookieData = document.cookie
  .split(';')
  .find(row => row.startsWith('paymentRequestData='))
  ?.split('=')[1];

if (cookieData) {
  const data = JSON.parse(decodeURIComponent(cookieData));
  console.log('Copy this data for migration:', JSON.stringify(data, null, 2));
}
```

2. **Import to database** using the migration script
3. **Verify migration** results using provided SQL queries
4. **Update application** to use database instead of cookies

## Security Configuration

### Database Security
```sql
-- Create application user (if using multi-user database)
-- Note: SQLite is file-based, so security is primarily file-system level

-- Set secure file permissions (Unix/Linux)
-- chmod 640 database/tpg_payment_system.db
-- chown app_user:app_group database/tpg_payment_system.db
```

### Application Security
```javascript
// Secure database connection example
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SecureDatabase {
  constructor() {
    const dbPath = path.resolve('./database/tpg_payment_system.db');
    
    // Verify database file exists and is readable
    if (!require('fs').existsSync(dbPath)) {
      throw new Error('Database file not found');
    }
    
    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        throw new Error(`Cannot open database: ${err.message}`);
      }
      
      // Enable security features
      this.db.run('PRAGMA foreign_keys = ON');
      this.db.run('PRAGMA trusted_schema = OFF');
    });
  }
  
  // Use prepared statements to prevent SQL injection
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}
```

## Backup and Recovery Setup

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
DB_FILE="./database/tpg_payment_system.db"
BACKUP_DIR="./database/backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/tpg_payment_backup_$TIMESTAMP.db"

echo "Starting database backup..."

# Create backup using SQLite backup command
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

# Verify backup
echo "Verifying backup integrity..."
sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" > /tmp/backup_check.log

if grep -q "ok" /tmp/backup_check.log; then
    echo "Backup verification successful"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "Backup created: ${BACKUP_FILE}.gz"
    
    # Clean old backups
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up"
else
    echo "Backup verification failed!"
    rm "$BACKUP_FILE"
    exit 1
fi

echo "Backup process completed successfully"
```

Make backup script executable:
```bash
chmod +x scripts/backup.sh
```

### Schedule Regular Backups
```bash
# Add to crontab for daily backups at 2 AM
# crontab -e
0 2 * * * /path/to/your/app/scripts/backup.sh
```

### Recovery Script
```bash
#!/bin/bash
# scripts/restore.sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.gz>"
    exit 1
fi

BACKUP_FILE="$1"
DB_FILE="./database/tpg_payment_system.db"
DB_BACKUP="./database/tpg_payment_system.db.backup.$(date +%Y%m%d_%H%M%S)"

echo "Starting database restoration..."

# Backup current database
echo "Backing up current database to $DB_BACKUP"
cp "$DB_FILE" "$DB_BACKUP"

# Extract and restore backup
echo "Restoring from $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" > "$DB_FILE"

# Verify restored database
echo "Verifying restored database..."
sqlite3 "$DB_FILE" "PRAGMA integrity_check;"

if [ $? -eq 0 ]; then
    echo "Database restoration completed successfully"
else
    echo "Database restoration failed, reverting to backup"
    mv "$DB_BACKUP" "$DB_FILE"
    exit 1
fi
```

## Performance Optimization Deployment

### Production SQLite Configuration
```sql
-- production-optimize.sql
-- Run after database creation for production deployment

-- Enable optimal settings
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 67108864;
PRAGMA optimize;

-- Create performance indexes
-- (These are included in the main schema but can be run separately if needed)

-- Analyze tables for optimal query planning
ANALYZE;

-- Update statistics
UPDATE system_settings 
SET setting_value = datetime('now') 
WHERE setting_key = 'last_optimization_run';

INSERT OR IGNORE INTO system_settings (setting_key, setting_value, data_type, description)
VALUES ('production_optimized', 'true', 'boolean', 'Database optimized for production');
```

### System Service Configuration (Linux)
```ini
# /etc/systemd/system/tpg-payment-system.service
[Unit]
Description=TPG Payment Request System
After=network.target

[Service]
Type=simple
User=tpg_user
WorkingDirectory=/opt/tpg-payment-system
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=/opt/tpg-payment-system/database /opt/tpg-payment-system/uploads /opt/tpg-payment-system/logs

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable tpg-payment-system
sudo systemctl start tpg-payment-system
```

## Testing and Validation

### Deployment Validation Script
```javascript
// scripts/validate-deployment.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function validateDeployment() {
  const dbPath = path.join(__dirname, '..', 'database', 'tpg_payment_system.db');
  const db = new sqlite3.Database(dbPath);
  
  const tests = [
    {
      name: 'Database file exists',
      test: () => require('fs').existsSync(dbPath)
    },
    {
      name: 'Database integrity check',
      test: () => new Promise((resolve) => {
        db.get('PRAGMA integrity_check', (err, row) => {
          resolve(!err && row && row.integrity_check === 'ok');
        });
      })
    },
    {
      name: 'Required tables exist',
      test: () => new Promise((resolve) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
          const tableNames = rows.map(r => r.name);
          const requiredTables = ['users', 'payment_requests', 'payment_details', 'suppliers', 'audit_logs'];
          resolve(requiredTables.every(table => tableNames.includes(table)));
        });
      })
    },
    {
      name: 'Admin user exists',
      test: () => new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"', (err, row) => {
          resolve(!err && row && row.count > 0);
        });
      })
    },
    {
      name: 'System settings configured',
      test: () => new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM system_settings', (err, row) => {
          resolve(!err && row && row.count > 0);
        });
      })
    }
  ];
  
  console.log('Running deployment validation...\n');
  
  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`✓ ${test.name}: ${result ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      console.log(`✗ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  db.close();
  console.log('\nValidation completed');
}

validateDeployment().catch(console.error);
```

Run validation:
```bash
node scripts/validate-deployment.js
```

## Monitoring and Maintenance

### Health Check Endpoint
```javascript
// Add to your Express app
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const db = new sqlite3.Database('./database/tpg_payment_system.db');
    
    const health = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            userCount: row.count
          });
        }
      });
    });
    
    db.close();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Log Monitoring
```javascript
// Simple logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Troubleshooting Common Issues

### Database Lock Issues
```bash
# If database is locked
lsof database/tpg_payment_system.db  # Find processes using the database
kill -9 <pid>  # Kill the process if necessary

# Reset WAL mode if needed
sqlite3 database/tpg_payment_system.db "PRAGMA journal_mode=DELETE;"
sqlite3 database/tpg_payment_system.db "PRAGMA journal_mode=WAL;"
```

### Permission Issues
```bash
# Fix file permissions
chmod 644 database/tpg_payment_system.db
chmod 755 database/
chmod 755 uploads/
chmod 644 logs/*
```

### Corruption Recovery
```sql
-- Check for corruption
PRAGMA integrity_check;

-- If corruption found, try to recover
.dump > backup.sql
-- Create new database from backup
```

## Production Checklist

- [ ] Database schema created successfully
- [ ] Initial data and settings configured
- [ ] Admin user created and password changed
- [ ] File permissions set correctly
- [ ] Backup system configured and tested
- [ ] SSL/HTTPS configured (if web-based)
- [ ] Firewall rules configured
- [ ] Monitoring and logging enabled
- [ ] Health checks working
- [ ] Performance optimization applied
- [ ] Migration from cookies completed (if applicable)
- [ ] User training completed
- [ ] Documentation updated

This deployment guide ensures a secure, performant, and maintainable installation of the TPG Payment Request System with full Vietnamese financial compliance capabilities.