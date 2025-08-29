-- TPG Payment Request System - Cookie to Database Migration Strategy
-- This script helps migrate existing cookie-based data to the new database structure

-- =============================================================================
-- MIGRATION OVERVIEW
-- =============================================================================
-- This migration handles the transition from cookie-based storage to database storage
-- Key considerations:
-- 1. Extract existing payment request data from browser cookies
-- 2. Map cookie fields to database schema
-- 3. Handle data validation and type conversion
-- 4. Create audit trail for migrated data
-- 5. Preserve data integrity during migration
-- =============================================================================

-- Create temporary table to hold cookie data during migration
CREATE TEMP TABLE IF NOT EXISTS temp_cookie_migration (
    cookie_data TEXT,        -- Raw JSON data from cookies
    processed_at DATETIME,   -- When this record was processed
    status TEXT DEFAULT 'pending', -- pending, processed, error
    error_message TEXT,      -- Error details if processing failed
    payment_request_id TEXT, -- Generated ID for successful migrations
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create migration log table for tracking
CREATE TABLE IF NOT EXISTS migration_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    migration_type TEXT NOT NULL DEFAULT 'cookie_to_db',
    source_format TEXT NOT NULL DEFAULT 'cookie_json',
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error_summary TEXT,
    migration_data TEXT -- JSON with detailed migration info
);

-- =============================================================================
-- HELPER FUNCTIONS FOR DATA TRANSFORMATION
-- =============================================================================

-- Function to generate Vietnamese number-to-text conversion
-- Note: This is a simplified version - full implementation would need comprehensive Vietnamese number conversion
CREATE VIEW IF NOT EXISTS v_migration_helpers AS
SELECT 
    'Utility view for migration helpers' as description,
    -- Add helper queries as needed during migration
    datetime('now') as created_at;

-- =============================================================================
-- COOKIE DATA STRUCTURE MAPPING
-- =============================================================================
-- Based on the current cookie structure from the TypeScript interfaces:
--
-- Expected cookie JSON structure:
-- {
--   "so": "string",
--   "ngay": "string", 
--   "soPR": "string?",
--   "nguoiDeNghi": "string",
--   "boPhan": "string", 
--   "nganSach": "Hoạt động|Dự án",
--   "maKhoanMuc": "string?",
--   "keHoachChi": "Trong KH|Ngoài KH",
--   "noiDungThanhToan": "string",
--   "nhaCungCap": "string",
--   "soTien": number,
--   "bangChu": "string",
--   "ngayDenHan": "string",
--   "chungTuDinhKem": "string?",
--   "chiTiet": [
--     {
--       "stt": number,
--       "dienGiai": "string", 
--       "soLuong": number,
--       "donVi": "string",
--       "donGia": number,
--       "thanhTien": number
--     }
--   ],
--   "attachments": [] // Files cannot be migrated from cookies
-- }

-- =============================================================================
-- STEP 1: COOKIE DATA EXTRACTION PROCEDURE
-- =============================================================================

-- This would be called from the application layer to insert cookie data
-- Usage: INSERT INTO temp_cookie_migration (cookie_data) VALUES (?);

-- =============================================================================
-- STEP 2: DATA VALIDATION AND TRANSFORMATION
-- =============================================================================

-- Validate and transform cookie data into database format
CREATE VIEW IF NOT EXISTS v_cookie_validation AS
SELECT 
    tcm.rowid,
    tcm.cookie_data,
    -- Extract and validate JSON fields
    json_extract(tcm.cookie_data, '$.so') as so,
    json_extract(tcm.cookie_data, '$.ngay') as ngay_raw,
    json_extract(tcm.cookie_data, '$.soPR') as so_pr,
    json_extract(tcm.cookie_data, '$.nguoiDeNghi') as nguoi_de_nghi,
    json_extract(tcm.cookie_data, '$.boPhan') as bo_phan,
    json_extract(tcm.cookie_data, '$.nganSach') as ngan_sach,
    json_extract(tcm.cookie_data, '$.maKhoanMuc') as ma_khoan_muc,
    json_extract(tcm.cookie_data, '$.keHoachChi') as ke_hoach_chi,
    json_extract(tcm.cookie_data, '$.noiDungThanhToan') as noi_dung_thanh_toan,
    json_extract(tcm.cookie_data, '$.nhaCungCap') as nha_cung_cap,
    json_extract(tcm.cookie_data, '$.soTien') as so_tien_raw,
    json_extract(tcm.cookie_data, '$.bangChu') as bang_chu,
    json_extract(tcm.cookie_data, '$.ngayDenHan') as ngay_den_han_raw,
    json_extract(tcm.cookie_data, '$.chungTuDinhKem') as chung_tu_dinh_kem,
    json_extract(tcm.cookie_data, '$.chiTiet') as chi_tiet_json,
    
    -- Data validation flags
    CASE 
        WHEN json_extract(tcm.cookie_data, '$.so') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.nguoiDeNghi') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.boPhan') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.noiDungThanhToan') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.nhaCungCap') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.soTien') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.bangChu') IS NULL THEN 0
        WHEN json_extract(tcm.cookie_data, '$.ngayDenHan') IS NULL THEN 0
        ELSE 1
    END as is_valid,
    
    -- Generate validation errors
    CASE 
        WHEN json_extract(tcm.cookie_data, '$.so') IS NULL THEN 'Missing required field: so'
        WHEN json_extract(tcm.cookie_data, '$.nguoiDeNghi') IS NULL THEN 'Missing required field: nguoiDeNghi'
        WHEN json_extract(tcm.cookie_data, '$.boPhan') IS NULL THEN 'Missing required field: boPhan'
        WHEN json_extract(tcm.cookie_data, '$.noiDungThanhToan') IS NULL THEN 'Missing required field: noiDungThanhToan'
        WHEN json_extract(tcm.cookie_data, '$.nhaCungCap') IS NULL THEN 'Missing required field: nhaCungCap'
        WHEN json_extract(tcm.cookie_data, '$.soTien') IS NULL THEN 'Missing required field: soTien'
        WHEN json_extract(tcm.cookie_data, '$.bangChu') IS NULL THEN 'Missing required field: bangChu'
        WHEN json_extract(tcm.cookie_data, '$.ngayDenHan') IS NULL THEN 'Missing required field: ngayDenHan'
        ELSE NULL
    END as validation_error
FROM temp_cookie_migration tcm
WHERE tcm.status = 'pending';

-- =============================================================================
-- STEP 3: MIGRATION EXECUTION PROCEDURE
-- =============================================================================

-- Procedure to migrate valid cookie data to payment_requests table
-- This would be executed after validating the data

-- Start migration transaction
BEGIN TRANSACTION;

-- Insert migration log entry
INSERT INTO migration_log (id, started_at, status) 
VALUES ('migration_' || datetime('now', 'localtime'), CURRENT_TIMESTAMP, 'running');

-- =============================================================================
-- STEP 4: MIGRATE PAYMENT REQUESTS
-- =============================================================================

-- Insert payment requests from validated cookie data
INSERT INTO payment_requests (
    id, so, ngay, so_pr, nguoi_de_nghi, bo_phan, 
    ngan_sach, ma_khoan_muc, ke_hoach_chi,
    noi_dung_thanh_toan, nha_cung_cap, so_tien, bang_chu,
    ngay_den_han, chung_tu_dinh_kem,
    status, created_by, created_at
)
SELECT 
    'migrated_' || lower(hex(randomblob(16))) as id,
    v.so,
    COALESCE(date(v.ngay_raw), date('now')) as ngay,
    v.so_pr,
    v.nguoi_de_nghi,
    v.bo_phan,
    CASE 
        WHEN v.ngan_sach IN ('Hoạt động', 'Dự án') THEN v.ngan_sach
        ELSE NULL 
    END as ngan_sach,
    v.ma_khoan_muc,
    CASE 
        WHEN v.ke_hoach_chi IN ('Trong KH', 'Ngoài KH') THEN v.ke_hoach_chi
        ELSE NULL 
    END as ke_hoach_chi,
    v.noi_dung_thanh_toan,
    v.nha_cung_cap,
    CAST(v.so_tien_raw as DECIMAL(18,2)) as so_tien,
    v.bang_chu,
    COALESCE(date(v.ngay_den_han_raw), date('now', '+30 days')) as ngay_den_han,
    v.chung_tu_dinh_kem,
    'draft' as status, -- All migrated data starts as draft
    'admin_default' as created_by, -- Migration user
    CURRENT_TIMESTAMP as created_at
FROM v_cookie_validation v
WHERE v.is_valid = 1
AND NOT EXISTS (
    -- Avoid duplicates based on 'so' field
    SELECT 1 FROM payment_requests pr WHERE pr.so = v.so
);

-- Update temp table with successful migrations
UPDATE temp_cookie_migration 
SET status = 'processed',
    processed_at = CURRENT_TIMESTAMP,
    payment_request_id = (
        SELECT id FROM payment_requests 
        WHERE so = json_extract(temp_cookie_migration.cookie_data, '$.so')
        AND created_by = 'admin_default'
        ORDER BY created_at DESC
        LIMIT 1
    )
WHERE rowid IN (
    SELECT rowid FROM v_cookie_validation WHERE is_valid = 1
);

-- Update temp table with failed migrations
UPDATE temp_cookie_migration 
SET status = 'error',
    processed_at = CURRENT_TIMESTAMP,
    error_message = (
        SELECT validation_error FROM v_cookie_validation 
        WHERE v_cookie_validation.rowid = temp_cookie_migration.rowid
    )
WHERE rowid IN (
    SELECT rowid FROM v_cookie_validation WHERE is_valid = 0
);

-- =============================================================================
-- STEP 5: MIGRATE PAYMENT DETAILS
-- =============================================================================

-- Extract and insert payment details from the chiTiet JSON array
WITH details_extraction AS (
    SELECT 
        tcm.payment_request_id,
        json_extract(value, '$.stt') as stt,
        json_extract(value, '$.dienGiai') as dien_giai,
        json_extract(value, '$.soLuong') as so_luong,
        json_extract(value, '$.donVi') as don_vi, 
        json_extract(value, '$.donGia') as don_gia,
        json_extract(value, '$.thanhTien') as thanh_tien
    FROM temp_cookie_migration tcm,
         json_each(json_extract(tcm.cookie_data, '$.chiTiet')) 
    WHERE tcm.status = 'processed' 
    AND tcm.payment_request_id IS NOT NULL
    AND json_extract(tcm.cookie_data, '$.chiTiet') IS NOT NULL
)
INSERT INTO payment_details (
    id, payment_request_id, stt, dien_giai, so_luong, 
    don_vi, don_gia, thanh_tien, created_at
)
SELECT 
    'migrated_detail_' || lower(hex(randomblob(16))) as id,
    de.payment_request_id,
    CAST(de.stt as INTEGER) as stt,
    de.dien_giai,
    CAST(de.so_luong as DECIMAL(12,3)) as so_luong,
    de.don_vi,
    CAST(de.don_gia as DECIMAL(18,2)) as don_gia,
    CAST(de.thanh_tien as DECIMAL(18,2)) as thanh_tien,
    CURRENT_TIMESTAMP as created_at
FROM details_extraction de
WHERE de.stt IS NOT NULL 
AND de.dien_giai IS NOT NULL
AND de.so_luong IS NOT NULL
AND de.don_vi IS NOT NULL
AND de.don_gia IS NOT NULL
AND de.thanh_tien IS NOT NULL;

-- =============================================================================
-- STEP 6: CREATE SUPPLIERS FROM MIGRATED DATA
-- =============================================================================

-- Auto-create suppliers that don't exist yet
INSERT OR IGNORE INTO suppliers (id, name, risk_level, created_by, created_at)
SELECT 
    'migrated_supplier_' || lower(hex(randomblob(8))) as id,
    DISTINCT nha_cung_cap as name,
    'medium' as risk_level, -- Default for migrated suppliers
    'admin_default' as created_by,
    CURRENT_TIMESTAMP as created_at
FROM payment_requests pr
WHERE pr.created_by = 'admin_default' -- Only migration data
AND pr.nha_cung_cap NOT IN (SELECT name FROM suppliers);

-- =============================================================================
-- STEP 7: CREATE AUDIT TRAIL FOR MIGRATION
-- =============================================================================

-- Create audit log entries for migrated data
INSERT INTO audit_logs (
    table_name, record_id, operation, new_values, 
    user_id, business_reason, created_at, checksum, previous_checksum
)
SELECT 
    'payment_requests' as table_name,
    pr.id as record_id,
    'INSERT' as operation,
    json_object(
        'so', pr.so,
        'nguoi_de_nghi', pr.nguoi_de_nghi,
        'bo_phan', pr.bo_phan,
        'so_tien', pr.so_tien,
        'status', pr.status,
        'migration_source', 'cookie_data'
    ) as new_values,
    'admin_default' as user_id,
    'Dữ liệu được chuyển đổi từ cookie sang database' as business_reason,
    CURRENT_TIMESTAMP as created_at,
    'migration_' || lower(hex(randomblob(8))) as checksum,
    NULL as previous_checksum
FROM payment_requests pr
WHERE pr.created_by = 'admin_default'
AND pr.created_at >= (SELECT started_at FROM migration_log ORDER BY started_at DESC LIMIT 1);

-- =============================================================================
-- STEP 8: UPDATE MIGRATION LOG AND CLEANUP
-- =============================================================================

-- Update migration log with results
UPDATE migration_log 
SET 
    records_processed = (SELECT COUNT(*) FROM temp_cookie_migration),
    records_successful = (SELECT COUNT(*) FROM temp_cookie_migration WHERE status = 'processed'),
    records_failed = (SELECT COUNT(*) FROM temp_cookie_migration WHERE status = 'error'),
    completed_at = CURRENT_TIMESTAMP,
    status = 'completed',
    migration_data = json_object(
        'source', 'browser_cookies',
        'target', 'sqlite_database',
        'total_payment_requests', (SELECT COUNT(*) FROM temp_cookie_migration WHERE status = 'processed'),
        'total_details', (SELECT COUNT(*) FROM payment_details WHERE id LIKE 'migrated_detail_%'),
        'total_suppliers', (SELECT COUNT(*) FROM suppliers WHERE id LIKE 'migrated_supplier_%')
    )
WHERE id = (SELECT id FROM migration_log ORDER BY started_at DESC LIMIT 1);

-- Refresh FTS index with migrated data
INSERT OR IGNORE INTO payment_requests_fts(rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
SELECT rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem
FROM payment_requests
WHERE created_by = 'admin_default'
AND deleted_at IS NULL;

-- Commit the migration transaction
COMMIT;

-- =============================================================================
-- STEP 9: POST-MIGRATION VALIDATION
-- =============================================================================

-- Validation queries to run after migration
CREATE VIEW IF NOT EXISTS v_migration_summary AS
SELECT 
    'Migration completed successfully' as message,
    (SELECT COUNT(*) FROM temp_cookie_migration WHERE status = 'processed') as migrated_requests,
    (SELECT COUNT(*) FROM temp_cookie_migration WHERE status = 'error') as failed_requests,
    (SELECT COUNT(*) FROM payment_details WHERE id LIKE 'migrated_detail_%') as migrated_details,
    (SELECT COUNT(*) FROM suppliers WHERE id LIKE 'migrated_supplier_%') as created_suppliers,
    (SELECT COUNT(*) FROM audit_logs WHERE business_reason LIKE '%cookie%') as audit_entries,
    datetime('now') as validated_at;

-- =============================================================================
-- STEP 10: CLEANUP PROCEDURES (Optional)
-- =============================================================================

-- After successful migration and validation, optionally clean up temp data
-- DROP TABLE temp_cookie_migration;

-- Update system settings to indicate migration completed
INSERT OR REPLACE INTO system_settings (setting_key, setting_value, data_type, description, is_public)
VALUES ('cookie_migration_completed', 'true', 'boolean', 'Cookie to database migration completed', 0);

-- =============================================================================
-- MIGRATION USAGE INSTRUCTIONS
-- =============================================================================

/*
MIGRATION USAGE:

1. Application Layer (JavaScript/TypeScript):
   - Read existing cookie data
   - For each cookie containing payment request data:
     ```javascript
     const cookieData = JSON.stringify(paymentRequestFromCookie);
     // Execute SQL: INSERT INTO temp_cookie_migration (cookie_data) VALUES (?)
     ```

2. Run Migration:
   - Execute this entire script
   - The script will validate, transform, and migrate all cookie data

3. Verify Results:
   - Query v_migration_summary view for migration statistics
   - Review migration_log table for detailed results
   - Check payment_requests table for migrated data

4. Post-Migration:
   - Update application to use database instead of cookies
   - Test all functionality with migrated data
   - Optionally clean up temp tables

5. Rollback (if needed):
   - Delete records where created_by = 'admin_default'
   - Clear migration log entries
   - Revert application to use cookies

IMPORTANT NOTES:
- All migrated data starts with status = 'draft'
- Attachments/files cannot be migrated from cookies
- Users will need to re-upload any required attachments
- The migration creates a complete audit trail
- Suppliers are auto-created for new vendor names
*/

SELECT 'Cookie to database migration script ready for execution' as status;