-- TPG Payment Request System - Database Initialization
-- This script sets up the database for first-time deployment
-- Run this after creating the database structure

-- Enable foreign key constraints and UTF-8 encoding
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';
PRAGMA journal_mode = WAL; -- Write-Ahead Logging for better concurrency
PRAGMA synchronous = NORMAL; -- Balance between safety and performance
PRAGMA cache_size = 10000; -- Cache size for better performance
PRAGMA temp_store = MEMORY; -- Store temporary tables in memory

-- =============================================================================
-- INITIAL SYSTEM CONFIGURATION
-- =============================================================================

-- System settings for TPG configuration
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('app_name', 'TPG Payment Request System', 'string', 'Application display name', 1),
('app_version', '1.0.0', 'string', 'Current application version', 1),
('company_name', 'Tiến Phước Group', 'string', 'Company name for documents', 1),
('company_address', 'Vietnam', 'string', 'Company address', 1),
('company_tax_code', '', 'string', 'Company tax identification number', 0),

-- File upload settings
('max_file_size_mb', '50', 'number', 'Maximum file upload size in MB', 0),
('max_attachments_per_request', '10', 'number', 'Maximum attachments per payment request', 0),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","png","jpg","jpeg","txt"]', 'json', 'Allowed file types for attachments', 0),
('upload_path', './uploads', 'string', 'Base path for file uploads', 0),

-- Currency and localization
('default_currency', 'VND', 'string', 'Default currency for payments', 1),
('currency_symbol', '₫', 'string', 'Currency symbol for display', 1),
('decimal_places', '0', 'number', 'Number of decimal places for VND', 1),
('date_format', 'dd/MM/yyyy', 'string', 'Default date format', 1),
('locale', 'vi-VN', 'string', 'Vietnamese locale for formatting', 1),

-- Financial settings
('fiscal_year_start_month', '1', 'number', 'Fiscal year start month (1-12)', 0),
('approval_required_amount', '10000000', 'number', 'Amount requiring manager approval (VND)', 0),
('high_priority_amount', '50000000', 'number', 'Amount requiring urgent processing (VND)', 0),
('auto_approve_limit', '1000000', 'number', 'Auto-approval limit for trusted users (VND)', 0),

-- Workflow settings
('default_payment_terms_days', '30', 'number', 'Default payment terms in days', 1),
('reminder_days_before_due', '3', 'number', 'Days before due date to send reminders', 0),
('auto_archive_completed_days', '90', 'number', 'Days after completion to auto-archive', 0),

-- Security and compliance
('session_timeout_hours', '8', 'number', 'User session timeout in hours', 0),
('password_min_length', '8', 'number', 'Minimum password length', 0),
('max_login_attempts', '5', 'number', 'Maximum failed login attempts', 0),
('lockout_duration_minutes', '30', 'number', 'Account lockout duration', 0),
('require_approval_comments', 'true', 'boolean', 'Require comments for approvals/rejections', 0),

-- Audit and retention
('audit_retention_years', '7', 'number', 'Audit log retention in years (Vietnamese law)', 0),
('backup_retention_days', '90', 'number', 'Backup file retention in days', 0),
('soft_delete_retention_years', '3', 'number', 'Soft deleted records retention', 0),

-- AI and analytics
('ai_enabled', 'false', 'boolean', 'Enable AI features', 0),
('ml_confidence_threshold', '0.8', 'number', 'Minimum confidence for ML predictions', 0),
('embedding_model', 'all-MiniLM-L6-v2', 'string', 'Default embedding model', 0),
('vector_dimension', '384', 'number', 'Vector dimension for embeddings', 0),

-- Reporting settings
('default_report_limit', '1000', 'number', 'Default limit for report queries', 0),
('export_max_records', '10000', 'number', 'Maximum records per export', 0),
('chart_default_months', '12', 'number', 'Default months for trend charts', 1);

-- =============================================================================
-- DEFAULT COST CENTERS AND BUDGET STRUCTURE
-- =============================================================================

-- Create default cost center hierarchy for TPG
INSERT OR IGNORE INTO cost_centers (id, code, name, fiscal_year, is_active, created_at) VALUES
('cc_default', 'DEFAULT', 'Mặc định - Migration Data', 2024, 1, CURRENT_TIMESTAMP),
('cc_admin', 'ADMIN', 'Hành chính quản trị', 2024, 1, CURRENT_TIMESTAMP),
('cc_hr', 'HR', 'Nhân sự', 2024, 1, CURRENT_TIMESTAMP),
('cc_finance', 'FIN', 'Tài chính kế toán', 2024, 1, CURRENT_TIMESTAMP),
('cc_it', 'IT', 'Công nghệ thông tin', 2024, 1, CURRENT_TIMESTAMP),
('cc_marketing', 'MKT', 'Marketing', 2024, 1, CURRENT_TIMESTAMP),
('cc_operations', 'OPS', 'Vận hành', 2024, 1, CURRENT_TIMESTAMP),
('cc_maintenance', 'MAINT', 'Bảo trì thiết bị', 2024, 1, CURRENT_TIMESTAMP),
('cc_project', 'PROJECT', 'Dự án', 2024, 1, CURRENT_TIMESTAMP);

-- Create fiscal year 2025 cost centers
INSERT OR IGNORE INTO cost_centers (code, name, fiscal_year, budget_amount, is_active, created_at) VALUES
('ADMIN_2025', 'Hành chính quản trị - 2025', 2025, 500000000, 1, CURRENT_TIMESTAMP),
('HR_2025', 'Nhân sự - 2025', 2025, 200000000, 1, CURRENT_TIMESTAMP),
('FIN_2025', 'Tài chính kế toán - 2025', 2025, 100000000, 1, CURRENT_TIMESTAMP),
('IT_2025', 'Công nghệ thông tin - 2025', 2025, 300000000, 1, CURRENT_TIMESTAMP),
('MKT_2025', 'Marketing - 2025', 2025, 400000000, 1, CURRENT_TIMESTAMP),
('OPS_2025', 'Vận hành - 2025', 2025, 800000000, 1, CURRENT_TIMESTAMP),
('MAINT_2025', 'Bảo trì thiết bị - 2025', 2025, 250000000, 1, CURRENT_TIMESTAMP),
('PROJECT_2025', 'Dự án - 2025', 2025, 1000000000, 1, CURRENT_TIMESTAMP);

-- =============================================================================
-- DEFAULT ADMIN USER
-- =============================================================================

-- Create default admin user (password should be changed on first login)
-- Default password: 'admin123' (hashed with bcrypt)
INSERT OR IGNORE INTO users (
    id, username, email, full_name, department, role, 
    password_hash, is_active, created_at
) VALUES (
    'admin_default',
    'admin',
    'admin@tpg.vn',
    'Quản trị hệ thống',
    'Công nghệ thông tin',
    'admin',
    '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', -- admin123
    1,
    CURRENT_TIMESTAMP
);

-- =============================================================================
-- SAMPLE SUPPLIERS
-- =============================================================================

-- Common Vietnamese suppliers for testing
INSERT OR IGNORE INTO suppliers (id, name, tax_code, address, risk_level, created_by, created_at) VALUES
('supplier_fpt', 'Công ty Cổ phần FPT', '0100109106', 'Hà Nội, Việt Nam', 'low', 'admin_default', CURRENT_TIMESTAMP),
('supplier_viettel', 'Tập đoàn Viettel', '0100109374', 'Hà Nội, Việt Nam', 'low', 'admin_default', CURRENT_TIMESTAMP),
('supplier_vingroup', 'Tập đoàn Vingroup', '0100100027', 'Hà Nội, Việt Nam', 'low', 'admin_default', CURRENT_TIMESTAMP),
('supplier_petrovietnam', 'Tập đoàn Dầu khí Việt Nam', '0100100503', 'Hà Nội, Việt Nam', 'medium', 'admin_default', CURRENT_TIMESTAMP),
('supplier_local_generic', 'Nhà cung cấp địa phương', '', 'Việt Nam', 'medium', 'admin_default', CURRENT_TIMESTAMP);

-- =============================================================================
-- PERFORMANCE OPTIMIZATION VIEWS
-- =============================================================================

-- View for payment request summary with calculated fields
CREATE VIEW IF NOT EXISTS v_payment_request_summary AS
SELECT 
    pr.id,
    pr.so,
    pr.ngay,
    pr.nguoi_de_nghi,
    pr.bo_phan,
    pr.nha_cung_cap,
    pr.so_tien,
    pr.status,
    pr.priority,
    pr.created_at,
    pr.ngay_den_han,
    
    -- Days until due
    CASE 
        WHEN pr.ngay_den_han < date('now') THEN 
            (julianday(date('now')) - julianday(pr.ngay_den_han))
        ELSE 
            (julianday(pr.ngay_den_han) - julianday(date('now')))
    END as days_until_due,
    
    -- Overdue flag
    CASE 
        WHEN pr.ngay_den_han < date('now') AND pr.status NOT IN ('paid', 'cancelled') 
        THEN 1 ELSE 0 
    END as is_overdue,
    
    -- Detail count
    (SELECT COUNT(*) FROM payment_details pd WHERE pd.payment_request_id = pr.id) as detail_count,
    
    -- Attachment count
    (SELECT COUNT(*) FROM attachments a WHERE a.payment_request_id = pr.id) as attachment_count,
    
    -- Creator name
    u.full_name as created_by_name,
    
    -- Approver name
    ua.full_name as approved_by_name

FROM payment_requests pr
LEFT JOIN users u ON pr.created_by = u.id
LEFT JOIN users ua ON pr.approved_by = ua.id
WHERE pr.deleted_at IS NULL;

-- View for department spending summary
CREATE VIEW IF NOT EXISTS v_department_spending AS
SELECT 
    bo_phan as department,
    COUNT(*) as total_requests,
    SUM(so_tien) as total_amount,
    AVG(so_tien) as average_amount,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    SUM(CASE WHEN status = 'approved' THEN so_tien ELSE 0 END) as approved_amount,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
    SUM(CASE WHEN status = 'pending' THEN so_tien ELSE 0 END) as pending_amount,
    MIN(ngay) as first_request_date,
    MAX(ngay) as last_request_date
FROM payment_requests
WHERE deleted_at IS NULL
GROUP BY bo_phan;

-- View for supplier performance
CREATE VIEW IF NOT EXISTS v_supplier_performance AS
SELECT 
    s.name as supplier_name,
    s.tax_code,
    s.risk_level,
    COUNT(pr.id) as total_requests,
    SUM(pr.so_tien) as total_amount,
    AVG(pr.so_tien) as average_amount,
    COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN pr.status = 'rejected' THEN 1 END) as rejected_count,
    ROUND(
        CAST(COUNT(CASE WHEN pr.status = 'approved' THEN 1 END) AS REAL) / 
        CAST(COUNT(*) AS REAL) * 100, 2
    ) as approval_rate,
    MIN(pr.ngay) as first_transaction,
    MAX(pr.ngay) as last_transaction
FROM suppliers s
LEFT JOIN payment_requests pr ON s.name = pr.nha_cung_cap
WHERE pr.deleted_at IS NULL OR pr.deleted_at IS NOT NULL
GROUP BY s.id, s.name, s.tax_code, s.risk_level
HAVING COUNT(pr.id) > 0;

-- Monthly spending trend view
CREATE VIEW IF NOT EXISTS v_monthly_spending AS
SELECT 
    strftime('%Y-%m', ngay) as month_year,
    strftime('%Y', ngay) as year,
    strftime('%m', ngay) as month,
    COUNT(*) as request_count,
    SUM(so_tien) as total_amount,
    AVG(so_tien) as average_amount,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
    SUM(CASE WHEN status = 'approved' THEN so_tien ELSE 0 END) as approved_amount,
    COUNT(DISTINCT nha_cung_cap) as unique_suppliers,
    COUNT(DISTINCT bo_phan) as unique_departments
FROM payment_requests
WHERE deleted_at IS NULL
GROUP BY strftime('%Y-%m', ngay)
ORDER BY month_year DESC;

-- =============================================================================
-- INITIALIZE FTS (FULL-TEXT SEARCH)
-- =============================================================================

-- Populate FTS table with existing data (will be empty on first run)
INSERT INTO payment_requests_fts(rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
SELECT rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem
FROM payment_requests
WHERE deleted_at IS NULL;

-- =============================================================================
-- DATABASE HEALTH CHECK FUNCTIONS
-- =============================================================================

-- Check database integrity
PRAGMA integrity_check;

-- Analyze tables for optimal query planning
ANALYZE;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Insert initialization completion record
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('database_initialized', 'true', 'boolean', 'Database initialization completed', 0),
('initialization_date', datetime('now'), 'string', 'Date and time of database initialization', 0),
('schema_version', '1.0.0', 'string', 'Current database schema version', 0);

-- Success message
SELECT 
    'TPG Payment Request System database initialized successfully!' as message,
    datetime('now') as initialized_at,
    '1.0.0' as schema_version;