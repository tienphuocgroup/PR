-- TPG Payment Request Management System Database Schema
-- Vietnamese Financial Compliance & AI Integration Support
-- SQLite Database Design
-- Created: 2025-08-26

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';

-- =============================================================================
-- USER MANAGEMENT TABLES
-- =============================================================================

-- Users table for authentication and audit trails
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL, -- Vietnamese: bộ phận
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    last_login_at DATETIME,
    password_hash TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id)
);

-- User sessions for security tracking
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PAYMENT REQUEST CORE TABLES
-- =============================================================================

-- Main payment request table
CREATE TABLE payment_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    so TEXT UNIQUE NOT NULL, -- Số phiếu đề nghị
    ngay DATE NOT NULL, -- Ngày lập phiếu
    so_pr TEXT, -- Số PR (optional reference)
    nguoi_de_nghi TEXT NOT NULL, -- Người đề nghị
    bo_phan TEXT NOT NULL, -- Bộ phận
    ngan_sach TEXT CHECK (ngan_sach IN ('Hoạt động', 'Dự án')), -- Ngân sách
    ma_khoan_muc TEXT, -- Mã khoản mục
    ke_hoach_chi TEXT CHECK (ke_hoach_chi IN ('Trong KH', 'Ngoài KH')), -- Kế hoạch chi
    noi_dung_thanh_toan TEXT NOT NULL, -- Nội dung thanh toán
    nha_cung_cap TEXT NOT NULL, -- Nhà cung cấp
    so_tien DECIMAL(18,2) NOT NULL CHECK (so_tien >= 0), -- Số tiền
    bang_chu TEXT NOT NULL, -- Bằng chữ
    ngay_den_han DATE NOT NULL, -- Ngày đến hạn
    chung_tu_dinh_kem TEXT, -- Chứng từ đính kèm description
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'submitted', 'approved', 'rejected', 'paid', 'cancelled')
    ),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    
    -- Approval workflow
    submitted_at DATETIME,
    approved_at DATETIME,
    approved_by TEXT REFERENCES users(id),
    rejection_reason TEXT,
    payment_date DATE,
    payment_reference TEXT,
    
    -- Audit fields
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME, -- Soft delete for audit trail
    created_by TEXT NOT NULL REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    version INTEGER NOT NULL DEFAULT 1, -- Optimistic locking
    
    -- Search optimization
    search_text TEXT GENERATED ALWAYS AS (
        so || ' ' || nguoi_de_nghi || ' ' || bo_phan || ' ' || 
        noi_dung_thanh_toan || ' ' || nha_cung_cap || ' ' || 
        COALESCE(so_pr, '') || ' ' || COALESCE(chung_tu_dinh_kem, '')
    ) STORED
);

-- Payment request details (line items)
CREATE TABLE payment_details (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    stt INTEGER NOT NULL, -- Số thứ tự
    dien_giai TEXT NOT NULL, -- Diễn giải
    so_luong DECIMAL(12,3) NOT NULL CHECK (so_luong > 0), -- Số lượng
    don_vi TEXT NOT NULL, -- Đơn vị
    don_gia DECIMAL(18,2) NOT NULL CHECK (don_gia >= 0), -- Đơn giá
    thanh_tien DECIMAL(18,2) NOT NULL CHECK (thanh_tien >= 0), -- Thành tiền
    
    -- Additional fields for enhanced tracking
    tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    tax_amount DECIMAL(18,2) DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
    discount_amount DECIMAL(18,2) DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(payment_request_id, stt)
);

-- File attachments
CREATE TABLE attachments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    stored_filename TEXT UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL,
    file_hash TEXT UNIQUE NOT NULL, -- SHA-256 for integrity verification
    description TEXT,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL REFERENCES users(id)
);

-- =============================================================================
-- AUDIT AND COMPLIANCE TABLES
-- =============================================================================

-- Comprehensive audit log for Vietnamese financial compliance
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values TEXT, -- JSON format
    new_values TEXT, -- JSON format
    changed_fields TEXT, -- JSON array of field names
    user_id TEXT REFERENCES users(id),
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    
    -- Compliance fields
    business_reason TEXT, -- Required for financial compliance
    approval_reference TEXT,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Cryptographic verification for immutability
    checksum TEXT NOT NULL, -- Hash of critical audit data
    previous_checksum TEXT, -- Chain verification
    
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_user (user_id)
);

-- Workflow state transitions
CREATE TABLE workflow_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    action TEXT NOT NULL,
    comments TEXT,
    
    -- Approval details
    approver_id TEXT REFERENCES users(id),
    approval_level INTEGER DEFAULT 1,
    requires_additional_approval BOOLEAN DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_workflow_payment_id (payment_request_id),
    INDEX idx_workflow_created_at (created_at)
);

-- =============================================================================
-- AI INTEGRATION TABLES
-- =============================================================================

-- Vector embeddings for semantic search and AI analysis
CREATE TABLE embeddings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    embedding_type TEXT NOT NULL CHECK (
        embedding_type IN ('content', 'description', 'supplier', 'category')
    ),
    model_name TEXT NOT NULL, -- e.g., 'text-embedding-ada-002', 'all-MiniLM-L6-v2'
    vector_data BLOB NOT NULL, -- Serialized vector (JSON or binary)
    vector_dimension INTEGER NOT NULL,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(payment_request_id, embedding_type, model_name),
    INDEX idx_embeddings_type (embedding_type),
    INDEX idx_embeddings_model (model_name)
);

-- AI analysis results and insights
CREATE TABLE ai_insights (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (
        insight_type IN ('risk_analysis', 'cost_prediction', 'supplier_analysis', 
                        'category_classification', 'anomaly_detection', 'trend_analysis')
    ),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Analysis results
    analysis_result TEXT NOT NULL, -- JSON format
    recommendations TEXT, -- JSON format
    risk_factors TEXT, -- JSON array
    
    -- Processing metadata
    processing_time_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ai_insights_type (insight_type),
    INDEX idx_ai_insights_confidence (confidence_score DESC),
    INDEX idx_ai_insights_created_at (created_at)
);

-- Training data for ML models
CREATE TABLE ml_training_data (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    payment_request_id TEXT REFERENCES payment_requests(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL CHECK (
        data_type IN ('text_classification', 'cost_prediction', 'risk_assessment', 
                     'supplier_categorization', 'approval_prediction')
    ),
    input_data TEXT NOT NULL, -- JSON format
    target_data TEXT NOT NULL, -- JSON format (labels, outcomes)
    
    -- Quality metrics
    data_quality_score DECIMAL(3,2),
    is_validated BOOLEAN DEFAULT 0,
    validated_by TEXT REFERENCES users(id),
    validated_at DATETIME,
    
    -- Model training metadata
    used_in_training BOOLEAN DEFAULT 0,
    training_batch_id TEXT,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_training_data_type (data_type),
    INDEX idx_training_data_validated (is_validated),
    INDEX idx_training_data_used (used_in_training)
);

-- =============================================================================
-- REPORTING AND ANALYTICS TABLES
-- =============================================================================

-- Supplier master data
CREATE TABLE suppliers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT UNIQUE NOT NULL,
    tax_code TEXT UNIQUE, -- Mã số thuế
    address TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    bank_account TEXT,
    bank_name TEXT,
    
    -- Risk assessment
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    credit_rating TEXT,
    blacklisted BOOLEAN DEFAULT 0,
    
    -- Performance metrics
    total_transactions INTEGER DEFAULT 0,
    total_amount DECIMAL(18,2) DEFAULT 0,
    average_payment_days DECIMAL(5,2) DEFAULT 0,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id),
    
    INDEX idx_suppliers_name (name),
    INDEX idx_suppliers_tax_code (tax_code),
    INDEX idx_suppliers_risk_level (risk_level)
);

-- Budget categories and cost centers
CREATE TABLE cost_centers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    code TEXT UNIQUE NOT NULL, -- Mã khoản mục
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES cost_centers(id),
    budget_amount DECIMAL(18,2),
    spent_amount DECIMAL(18,2) DEFAULT 0,
    remaining_amount DECIMAL(18,2) GENERATED ALWAYS AS (
        COALESCE(budget_amount, 0) - COALESCE(spent_amount, 0)
    ) STORED,
    
    fiscal_year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_cost_centers_code (code),
    INDEX idx_cost_centers_fiscal_year (fiscal_year),
    INDEX idx_cost_centers_parent (parent_id)
);

-- =============================================================================
-- SYSTEM CONFIGURATION TABLES
-- =============================================================================

-- System settings and configuration
CREATE TABLE system_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT 0, -- Whether setting can be read by non-admin users
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT REFERENCES users(id)
);

-- Data export/import logs
CREATE TABLE data_operations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('export', 'import', 'backup', 'restore')),
    format TEXT NOT NULL CHECK (format IN ('json', 'csv', 'xlsx', 'sql')),
    file_path TEXT,
    file_size INTEGER,
    record_count INTEGER,
    
    -- Operation details
    filters TEXT, -- JSON format for export filters
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')
    ),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    error_message TEXT,
    
    -- Timing
    started_at DATETIME,
    completed_at DATETIME,
    duration_seconds INTEGER,
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL REFERENCES users(id),
    
    INDEX idx_data_ops_type (operation_type),
    INDEX idx_data_ops_status (status),
    INDEX idx_data_ops_created_at (created_at)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Payment requests indexes
CREATE INDEX idx_payment_requests_so ON payment_requests(so);
CREATE INDEX idx_payment_requests_ngay ON payment_requests(ngay DESC);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_by ON payment_requests(created_by);
CREATE INDEX idx_payment_requests_bo_phan ON payment_requests(bo_phan);
CREATE INDEX idx_payment_requests_nha_cung_cap ON payment_requests(nha_cung_cap);
CREATE INDEX idx_payment_requests_so_tien ON payment_requests(so_tien DESC);
CREATE INDEX idx_payment_requests_deleted_at ON payment_requests(deleted_at);
CREATE INDEX idx_payment_requests_search ON payment_requests(search_text);

-- Composite indexes for common query patterns
CREATE INDEX idx_payment_requests_status_ngay ON payment_requests(status, ngay DESC);
CREATE INDEX idx_payment_requests_bo_phan_status ON payment_requests(bo_phan, status);
CREATE INDEX idx_payment_requests_created_by_status ON payment_requests(created_by, status);

-- Payment details indexes
CREATE INDEX idx_payment_details_payment_id ON payment_details(payment_request_id);
CREATE INDEX idx_payment_details_stt ON payment_details(payment_request_id, stt);

-- Attachments indexes
CREATE INDEX idx_attachments_payment_id ON attachments(payment_request_id);
CREATE INDEX idx_attachments_hash ON attachments(file_hash);

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================================================
-- FULL-TEXT SEARCH SETUP
-- =============================================================================

-- Virtual table for full-text search
CREATE VIRTUAL TABLE payment_requests_fts USING fts5(
    so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, 
    nha_cung_cap, so_pr, chung_tu_dinh_kem,
    content='payment_requests', content_rowid='rowid'
);

-- Triggers to keep FTS table synchronized
CREATE TRIGGER payment_requests_fts_insert AFTER INSERT ON payment_requests BEGIN
    INSERT INTO payment_requests_fts(rowid, so, nguoi_de_nghi, bo_phan, 
        noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
    VALUES (NEW.rowid, NEW.so, NEW.nguoi_de_nghi, NEW.bo_phan, 
        NEW.noi_dung_thanh_toan, NEW.nha_cung_cap, NEW.so_pr, NEW.chung_tu_dinh_kem);
END;

CREATE TRIGGER payment_requests_fts_delete AFTER DELETE ON payment_requests BEGIN
    INSERT INTO payment_requests_fts(payment_requests_fts, rowid, so, nguoi_de_nghi, 
        bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
    VALUES ('delete', OLD.rowid, OLD.so, OLD.nguoi_de_nghi, OLD.bo_phan, 
        OLD.noi_dung_thanh_toan, OLD.nha_cung_cap, OLD.so_pr, OLD.chung_tu_dinh_kem);
END;

CREATE TRIGGER payment_requests_fts_update AFTER UPDATE ON payment_requests BEGIN
    INSERT INTO payment_requests_fts(payment_requests_fts, rowid, so, nguoi_de_nghi, 
        bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
    VALUES ('delete', OLD.rowid, OLD.so, OLD.nguoi_de_nghi, OLD.bo_phan, 
        OLD.noi_dung_thanh_toan, OLD.nha_cung_cap, OLD.so_pr, OLD.chung_tu_dinh_kem);
    INSERT INTO payment_requests_fts(rowid, so, nguoi_de_nghi, bo_phan, 
        noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
    VALUES (NEW.rowid, NEW.so, NEW.nguoi_de_nghi, NEW.bo_phan, 
        NEW.noi_dung_thanh_toan, NEW.nha_cung_cap, NEW.so_pr, NEW.chung_tu_dinh_kem);
END;

-- =============================================================================
-- AUDIT TRIGGERS
-- =============================================================================

-- Trigger for automatic audit logging
CREATE TRIGGER audit_payment_requests_insert AFTER INSERT ON payment_requests BEGIN
    INSERT INTO audit_logs (table_name, record_id, operation, new_values, 
        user_id, created_at, checksum, previous_checksum)
    VALUES ('payment_requests', NEW.id, 'INSERT', 
        json_object(
            'so', NEW.so, 'ngay', NEW.ngay, 'nguoi_de_nghi', NEW.nguoi_de_nghi,
            'bo_phan', NEW.bo_phan, 'so_tien', NEW.so_tien, 'status', NEW.status
        ),
        NEW.created_by, CURRENT_TIMESTAMP,
        hex(randomblob(16)), 
        (SELECT checksum FROM audit_logs ORDER BY created_at DESC LIMIT 1)
    );
END;

-- Update triggers for updated_at timestamps
CREATE TRIGGER update_payment_requests_timestamp AFTER UPDATE ON payment_requests BEGIN
    UPDATE payment_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_users_timestamp AFTER UPDATE ON users BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_suppliers_timestamp AFTER UPDATE ON suppliers BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =============================================================================
-- INITIAL SYSTEM DATA
-- =============================================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('app_name', 'TPG Payment Request System', 'string', 'Application display name', 1),
('version', '1.0.0', 'string', 'Current application version', 1),
('max_file_size_mb', '50', 'number', 'Maximum file upload size in MB', 0),
('allowed_file_types', '["pdf","doc","docx","xls","xlsx","png","jpg","jpeg"]', 'json', 'Allowed file types for attachments', 0),
('default_currency', 'VND', 'string', 'Default currency for payments', 1),
('fiscal_year_start_month', '1', 'number', 'Fiscal year start month (1-12)', 0),
('approval_required_amount', '10000000', 'number', 'Amount requiring approval (VND)', 0),
('backup_retention_days', '90', 'number', 'Number of days to retain backups', 0),
('audit_retention_years', '7', 'number', 'Number of years to retain audit logs', 0);

-- Insert default cost center for existing data migration
INSERT INTO cost_centers (code, name, fiscal_year, is_active) VALUES
('DEFAULT', 'Mặc định - Dữ liệu cũ', 2024, 1);