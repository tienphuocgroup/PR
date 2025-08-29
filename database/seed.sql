-- TPG Payment Request System - Sample Data for Development/Testing
-- This script creates realistic Vietnamese payment request data
-- Run after database initialization for testing purposes

-- =============================================================================
-- SAMPLE USERS FOR TESTING
-- =============================================================================

-- Additional test users beyond the default admin
INSERT OR IGNORE INTO users (id, username, email, full_name, department, role, password_hash, is_active, created_by, created_at) VALUES
('user_manager_1', 'manager1', 'manager1@tpg.vn', 'Nguyễn Văn Quản Lý', 'Tài chính kế toán', 'manager', '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', 1, 'admin_default', CURRENT_TIMESTAMP),
('user_staff_1', 'staff1', 'staff1@tpg.vn', 'Trần Thị Nhân Viên', 'Hành chính', 'user', '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', 1, 'admin_default', CURRENT_TIMESTAMP),
('user_staff_2', 'staff2', 'staff2@tpg.vn', 'Lê Văn Đề Nghị', 'Marketing', 'user', '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', 1, 'admin_default', CURRENT_TIMESTAMP),
('user_staff_3', 'staff3', 'staff3@tpg.vn', 'Phạm Thị Kế Toán', 'Tài chính kế toán', 'user', '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', 1, 'admin_default', CURRENT_TIMESTAMP),
('user_viewer_1', 'viewer1', 'viewer1@tpg.vn', 'Hoàng Văn Xem', 'Kiểm toán nội bộ', 'viewer', '$2b$10$rQZ7VxqQJ1bz1H5L4v4Ahu.kKLxJRlnOlxY8F3KpjBvJgP5OYVQ3O', 1, 'admin_default', CURRENT_TIMESTAMP);

-- =============================================================================
-- EXTENDED SUPPLIER DATA
-- =============================================================================

INSERT OR IGNORE INTO suppliers (id, name, tax_code, address, contact_person, phone, email, risk_level, created_by, created_at) VALUES
-- Technology suppliers
('supplier_samsung', 'Samsung Electronics Vietnam', '0301547578', 'Bắc Ninh, Việt Nam', 'Nguyễn Văn A', '0901234567', 'contact@samsung.vn', 'low', 'admin_default', CURRENT_TIMESTAMP),
('supplier_hp', 'HP Vietnam', '0301234567', 'TP.HCM, Việt Nam', 'Trần Thị B', '0902345678', 'info@hp.com.vn', 'low', 'admin_default', CURRENT_TIMESTAMP),
('supplier_dell', 'Dell Technologies Vietnam', '0301345678', 'Hà Nội, Việt Nam', 'Lê Văn C', '0903456789', 'sales@dell.vn', 'low', 'admin_default', CURRENT_TIMESTAMP),

-- Office supplies
('supplier_phuongdong', 'Công ty TNHH Phương Đông', '0102345678', 'Hà Nội, Việt Nam', 'Phạm Văn D', '0904567890', 'info@phuongdong.vn', 'medium', 'admin_default', CURRENT_TIMESTAMP),
('supplier_hongnhat', 'Văn phòng phẩm Hồng Nhật', '0103456789', 'TP.HCM, Việt Nam', 'Nguyễn Thị E', '0905678901', 'sales@hongnhat.com', 'medium', 'admin_default', CURRENT_TIMESTAMP),

-- Services
('supplier_cleaningservice', 'Dịch vụ vệ sinh Minh Tâm', '0104567890', 'Hà Nội, Việt Nam', 'Trần Văn F', '0906789012', 'contact@minhtam.vn', 'medium', 'admin_default', CURRENT_TIMESTAMP),
('supplier_security', 'Bảo vệ An Ninh 24/7', '0105678901', 'TP.HCM, Việt Nam', 'Lê Thị G', '0907890123', 'info@anninh247.vn', 'medium', 'admin_default', CURRENT_TIMESTAMP),
('supplier_catering', 'Suất ăn công nghiệp Tân Phát', '0106789012', 'Bình Dương, Việt Nam', 'Phạm Văn H', '0908901234', 'order@tanphat.com.vn', 'high', 'admin_default', CURRENT_TIMESTAMP),

-- Construction and maintenance
('supplier_construction', 'Xây dựng Tiến Bộ', '0107890123', 'Hà Nội, Việt Nam', 'Nguyễn Văn I', '0909012345', 'info@tienbo.vn', 'high', 'admin_default', CURRENT_TIMESTAMP),
('supplier_electrical', 'Điện lạnh Thành Công', '0108901234', 'TP.HCM, Việt Nam', 'Trần Thị K', '0910123456', 'service@thanhcong.vn', 'medium', 'admin_default', CURRENT_TIMESTAMP);

-- =============================================================================
-- SAMPLE PAYMENT REQUESTS - VARIOUS SCENARIOS
-- =============================================================================

-- Request 1: Office equipment purchase (approved)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi, ma_khoan_muc,
    created_by, created_at, submitted_at, approved_at, approved_by
) VALUES (
    'pr_001', 'DN001/2024', '2024-01-15', 'Nguyễn Văn Quản Lý', 'Tài chính kế toán',
    'Mua máy tính để bàn cho phòng kế toán', 'Dell Technologies Vietnam',
    25000000, 'Hai mươi lăm triệu đồng chẵn', '2024-02-15', 'approved', 'normal',
    'Hoạt động', 'Trong KH', 'IT_2024_001',
    'user_manager_1', '2024-01-15 08:30:00', '2024-01-15 09:00:00', '2024-01-16 10:30:00', 'admin_default'
);

-- Request 2: Marketing campaign (submitted, pending approval)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi, ma_khoan_muc,
    created_by, created_at, submitted_at
) VALUES (
    'pr_002', 'DN002/2024', '2024-01-20', 'Lê Văn Đề Nghị', 'Marketing',
    'Chi phí quảng cáo Facebook cho Q1/2024', 'Facebook Ireland Limited',
    15000000, 'Mười lăm triệu đồng chẵn', '2024-02-20', 'submitted', 'high',
    'Hoạt động', 'Trong KH', 'MKT_2024_001',
    'user_staff_2', '2024-01-20 14:15:00', '2024-01-20 14:30:00'
);

-- Request 3: Office supplies (draft)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi,
    created_by, created_at
) VALUES (
    'pr_003', 'DN003/2024', '2024-01-25', 'Trần Thị Nhân Viên', 'Hành chính',
    'Mua văn phòng phẩm quý 1', 'Văn phòng phẩm Hồng Nhật',
    3500000, 'Ba triệu năm trăm nghìn đồng chẵn', '2024-02-25', 'draft', 'normal',
    'Hoạt động', 'Trong KH',
    'user_staff_1', '2024-01-25 16:45:00'
);

-- Request 4: Emergency repair (urgent, approved)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi, ma_khoan_muc,
    created_by, created_at, submitted_at, approved_at, approved_by
) VALUES (
    'pr_004', 'DN004/2024', '2024-02-01', 'Phạm Thị Kế Toán', 'Tài chính kế toán',
    'Sửa chữa khẩn cấp hệ thống điều hòa', 'Điện lạnh Thành Công',
    8000000, 'Tám triệu đồng chẵn', '2024-02-05', 'approved', 'urgent',
    'Hoạt động', 'Ngoài KH', 'MAINT_2024_001',
    'user_staff_3', '2024-02-01 09:00:00', '2024-02-01 09:15:00', '2024-02-01 11:30:00', 'user_manager_1'
);

-- Request 5: Large project payment (high value, requires additional approval)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi, ma_khoan_muc,
    created_by, created_at, submitted_at
) VALUES (
    'pr_005', 'DN005/2024', '2024-02-05', 'Nguyễn Văn Quản Lý', 'Tài chính kế toán',
    'Thanh toán giai đoạn 1 dự án nâng cấp hạ tầng', 'Xây dựng Tiến Bộ',
    75000000, 'Bảy mươi lăm triệu đồng chẵn', '2024-03-05', 'submitted', 'high',
    'Dự án', 'Trong KH', 'PROJECT_2024_001',
    'user_manager_1', '2024-02-05 10:00:00', '2024-02-05 10:30:00'
);

-- Request 6: Monthly service payment (paid)
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi, ma_khoan_muc,
    created_by, created_at, submitted_at, approved_at, approved_by, payment_date, payment_reference
) VALUES (
    'pr_006', 'DN006/2024', '2024-01-30', 'Trần Thị Nhân Viên', 'Hành chính',
    'Dịch vụ vệ sinh văn phòng tháng 1/2024', 'Dịch vụ vệ sinh Minh Tâm',
    12000000, 'Mười hai triệu đồng chẵn', '2024-02-28', 'paid', 'normal',
    'Hoạt động', 'Trong KH', 'ADMIN_2024_001',
    'user_staff_1', '2024-01-30 08:00:00', '2024-01-30 08:15:00', '2024-02-01 14:00:00', 'user_manager_1', '2024-02-15', 'TT001/2024'
);

-- Request 7: Rejected request
INSERT OR IGNORE INTO payment_requests (
    id, so, ngay, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap,
    so_tien, bang_chu, ngay_den_han, status, priority,
    ngan_sach, ke_hoach_chi,
    rejection_reason,
    created_by, created_at, submitted_at, approved_at, approved_by
) VALUES (
    'pr_007', 'DN007/2024', '2024-02-10', 'Lê Văn Đề Nghị', 'Marketing',
    'Mua thiết bị âm thanh không cần thiết', 'Samsung Electronics Vietnam',
    30000000, 'Ba mươi triệu đồng chẵn', '2024-03-10', 'rejected', 'low',
    'Hoạt động', 'Ngoài KH',
    'Không đủ ngân sách và không cần thiết cho hoạt động hiện tại',
    'user_staff_2', '2024-02-10 15:20:00', '2024-02-10 15:45:00', '2024-02-12 09:30:00', 'user_manager_1'
);

-- =============================================================================
-- PAYMENT DETAILS FOR THE ABOVE REQUESTS
-- =============================================================================

-- Details for Request 1 (Office equipment)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien, tax_rate, tax_amount) VALUES
('pd_001_1', 'pr_001', 1, 'Máy tính để bàn Dell OptiPlex 3080', 3, 'Bộ', 7500000, 22500000, 10, 2250000),
('pd_001_2', 'pr_001', 2, 'Bàn phím và chuột Dell', 3, 'Bộ', 500000, 1500000, 10, 150000),
('pd_001_3', 'pr_001', 3, 'Dịch vụ cài đặt và bảo hành', 1, 'Gói', 1000000, 1000000, 10, 100000);

-- Details for Request 2 (Marketing)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien) VALUES
('pd_002_1', 'pr_002', 1, 'Quảng cáo Facebook Ads - Tháng 1', 1, 'Tháng', 5000000, 5000000),
('pd_002_2', 'pr_002', 2, 'Quảng cáo Facebook Ads - Tháng 2', 1, 'Tháng', 5000000, 5000000),
('pd_002_3', 'pr_002', 3, 'Quảng cáo Facebook Ads - Tháng 3', 1, 'Tháng', 5000000, 5000000);

-- Details for Request 3 (Office supplies)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien, tax_rate, tax_amount) VALUES
('pd_003_1', 'pr_003', 1, 'Giấy A4 80gsm', 50, 'Ream', 45000, 2250000, 10, 225000),
('pd_003_2', 'pr_003', 2, 'Bút bi xanh Thiên Long', 100, 'Cái', 3000, 300000, 10, 30000),
('pd_003_3', 'pr_003', 3, 'Kẹp tài liệu', 20, 'Cái', 15000, 300000, 10, 30000),
('pd_003_4', 'pr_003', 4, 'Máy tính để bàn', 5, 'Cái', 120000, 600000, 10, 60000),
('pd_003_5', 'pr_003', 5, 'Băng keo trong', 10, 'Cuộn', 5000, 50000, 10, 5000);

-- Details for Request 4 (Emergency repair)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien, tax_rate, tax_amount) VALUES
('pd_004_1', 'pr_004', 1, 'Thay thế linh kiện máy nén', 1, 'Bộ', 5000000, 5000000, 10, 500000),
('pd_004_2', 'pr_004', 2, 'Chi phí nhân công khẩn cấp', 8, 'Giờ', 200000, 1600000, 10, 160000),
('pd_004_3', 'pr_004', 3, 'Vật liệu phụ trợ', 1, 'Lô', 1400000, 1400000, 10, 140000);

-- Details for Request 5 (Project payment)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien, tax_rate, tax_amount) VALUES
('pd_005_1', 'pr_005', 1, 'Thiết kế kiến trúc hệ thống', 1, 'Giai đoạn', 25000000, 25000000, 10, 2500000),
('pd_005_2', 'pr_005', 2, 'Cung cấp thiết bị server', 2, 'Máy', 20000000, 40000000, 10, 4000000),
('pd_005_3', 'pr_005', 3, 'Dịch vụ triển khai và cấu hình', 1, 'Gói', 10000000, 10000000, 10, 1000000);

-- Details for Request 6 (Service payment)
INSERT OR IGNORE INTO payment_details (id, payment_request_id, stt, dien_giai, so_luong, don_vi, don_gia, thanh_tien, tax_rate, tax_amount) VALUES
('pd_006_1', 'pr_006', 1, 'Vệ sinh văn phòng hàng ngày', 20, 'Ngày', 300000, 6000000, 10, 600000),
('pd_006_2', 'pr_006', 2, 'Vệ sinh tổng thể cuối tháng', 1, 'Lần', 2000000, 2000000, 10, 200000),
('pd_006_3', 'pr_006', 3, 'Vật tư vệ sinh', 1, 'Tháng', 4000000, 4000000, 10, 400000);

-- =============================================================================
-- WORKFLOW HISTORY FOR COMPLETED REQUESTS
-- =============================================================================

-- Workflow for Request 1 (approved)
INSERT OR IGNORE INTO workflow_history (id, payment_request_id, from_status, to_status, action, comments, approver_id, created_at) VALUES
('wf_001_1', 'pr_001', 'draft', 'submitted', 'submit', 'Gửi đề nghị mua thiết bị văn phòng', NULL, '2024-01-15 09:00:00'),
('wf_001_2', 'pr_001', 'submitted', 'approved', 'approve', 'Phê duyệt mua thiết bị cần thiết cho phòng kế toán', 'admin_default', '2024-01-16 10:30:00');

-- Workflow for Request 4 (urgent, fast approval)
INSERT OR IGNORE INTO workflow_history (id, payment_request_id, from_status, to_status, action, comments, approver_id, created_at) VALUES
('wf_004_1', 'pr_004', 'draft', 'submitted', 'submit', 'Gửi đề nghị sửa chữa khẩn cấp', NULL, '2024-02-01 09:15:00'),
('wf_004_2', 'pr_004', 'submitted', 'approved', 'approve', 'Phê duyệt khẩn cấp - hệ thống điều hòa cần sửa ngay', 'user_manager_1', '2024-02-01 11:30:00');

-- Workflow for Request 6 (paid)
INSERT OR IGNORE INTO workflow_history (id, payment_request_id, from_status, to_status, action, comments, approver_id, created_at) VALUES
('wf_006_1', 'pr_006', 'draft', 'submitted', 'submit', 'Gửi đề nghị thanh toán dịch vụ định kỳ', NULL, '2024-01-30 08:15:00'),
('wf_006_2', 'pr_006', 'submitted', 'approved', 'approve', 'Phê duyệt thanh toán dịch vụ vệ sinh hàng tháng', 'user_manager_1', '2024-02-01 14:00:00'),
('wf_006_3', 'pr_006', 'approved', 'paid', 'payment_completed', 'Đã thanh toán theo chứng từ TT001/2024', NULL, '2024-02-15 16:30:00');

-- Workflow for Request 7 (rejected)
INSERT OR IGNORE INTO workflow_history (id, payment_request_id, from_status, to_status, action, comments, approver_id, created_at) VALUES
('wf_007_1', 'pr_007', 'draft', 'submitted', 'submit', 'Gửi đề nghị mua thiết bị âm thanh', NULL, '2024-02-10 15:45:00'),
('wf_007_2', 'pr_007', 'submitted', 'rejected', 'reject', 'Từ chối - không cần thiết và vượt ngân sách', 'user_manager_1', '2024-02-12 09:30:00');

-- =============================================================================
-- SAMPLE AI INSIGHTS (for demonstration)
-- =============================================================================

-- Risk analysis for high-value request
INSERT OR IGNORE INTO ai_insights (
    id, payment_request_id, insight_type, model_name, model_version, confidence_score,
    analysis_result, recommendations, risk_factors, processing_time_ms, created_at
) VALUES (
    'ai_001', 'pr_005', 'risk_analysis', 'tpg-risk-model-v1', '1.0.0', 0.85,
    '{"risk_score": 0.65, "category": "medium_risk", "primary_factors": ["high_amount", "new_supplier", "project_payment"]}',
    '["Require additional approval due to high amount", "Verify supplier credentials", "Request project milestone documentation"]',
    '["amount_above_threshold", "supplier_transaction_history_limited", "payment_type_project"]',
    1250, '2024-02-05 11:00:00'
);

-- Cost prediction analysis
INSERT OR IGNORE INTO ai_insights (
    id, payment_request_id, insight_type, model_name, model_version, confidence_score,
    analysis_result, recommendations, processing_time_ms, created_at
) VALUES (
    'ai_002', 'pr_002', 'cost_prediction', 'tpg-cost-model-v1', '1.0.0', 0.92,
    '{"predicted_total": 14750000, "variance": 250000, "category": "marketing_digital", "seasonal_factor": 1.1}',
    '["Budget is reasonable for Q1 marketing", "Consider performance tracking metrics", "Plan for Q2 budget allocation"]',
    890, '2024-01-20 15:00:00'
);

-- Supplier analysis
INSERT OR IGNORE INTO ai_insights (
    id, payment_request_id, insight_type, model_name, model_version, confidence_score,
    analysis_result, recommendations, risk_factors, processing_time_ms, created_at
) VALUES (
    'ai_003', 'pr_001', 'supplier_analysis', 'tpg-supplier-model-v1', '1.0.0', 0.88,
    '{"supplier_score": 0.92, "reliability": "high", "price_competitiveness": 0.85, "delivery_performance": 0.90}',
    '["Excellent supplier choice", "Consider bulk ordering for better pricing", "Maintain relationship for future purchases"]',
    '["none_identified"]',
    670, '2024-01-15 10:00:00'
);

-- =============================================================================
-- SAMPLE AUDIT LOGS
-- =============================================================================

-- Audit log entries for the payment request operations
INSERT OR IGNORE INTO audit_logs (
    id, table_name, record_id, operation, new_values, user_id, 
    business_reason, created_at, checksum, previous_checksum
) VALUES 
('audit_001', 'payment_requests', 'pr_001', 'INSERT', '{"so": "DN001/2024", "status": "draft", "so_tien": 25000000}', 'user_manager_1', 'Tạo đề nghị mua thiết bị văn phòng', '2024-01-15 08:30:00', 'abc123def456', NULL),
('audit_002', 'payment_requests', 'pr_001', 'UPDATE', '{"status": "submitted"}', 'user_manager_1', 'Gửi đề nghị phê duyệt', '2024-01-15 09:00:00', 'def456ghi789', 'abc123def456'),
('audit_003', 'payment_requests', 'pr_001', 'UPDATE', '{"status": "approved", "approved_by": "admin_default"}', 'admin_default', 'Phê duyệt đề nghị mua thiết bị', '2024-01-16 10:30:00', 'ghi789jkl012', 'def456ghi789');

-- =============================================================================
-- SAMPLE ML TRAINING DATA
-- =============================================================================

-- Training data for cost prediction
INSERT OR IGNORE INTO ml_training_data (
    id, payment_request_id, data_type, input_data, target_data, 
    data_quality_score, is_validated, validated_by, created_at
) VALUES
('ml_001', 'pr_001', 'cost_prediction', 
    '{"category": "IT_equipment", "department": "finance", "items": 3, "description_keywords": ["computer", "dell", "office"]}',
    '{"actual_cost": 25000000, "approval_time_days": 1, "vendor_rating": 0.9}',
    0.95, 1, 'admin_default', '2024-01-20 00:00:00'),
('ml_002', 'pr_006', 'cost_prediction',
    '{"category": "services", "department": "admin", "recurring": true, "description_keywords": ["cleaning", "monthly", "office"]}',
    '{"actual_cost": 12000000, "approval_time_days": 2, "vendor_rating": 0.8}',
    0.92, 1, 'user_manager_1', '2024-02-20 00:00:00');

-- Training data for risk assessment
INSERT OR IGNORE INTO ml_training_data (
    id, payment_request_id, data_type, input_data, target_data,
    data_quality_score, is_validated, validated_by, created_at
) VALUES
('ml_003', 'pr_005', 'risk_assessment',
    '{"amount": 75000000, "supplier_history": "new", "category": "project", "urgency": "high"}',
    '{"risk_score": 0.65, "requires_additional_approval": true, "approval_outcome": "pending"}',
    0.88, 1, 'admin_default', '2024-02-10 00:00:00'),
('ml_004', 'pr_007', 'risk_assessment',
    '{"amount": 30000000, "supplier_history": "known", "category": "equipment", "urgency": "low", "budget_status": "over"}',
    '{"risk_score": 0.85, "requires_additional_approval": true, "approval_outcome": "rejected"}',
    0.94, 1, 'user_manager_1', '2024-02-15 00:00:00');

-- =============================================================================
-- UPDATE SUPPLIER PERFORMANCE METRICS
-- =============================================================================

-- Update supplier metrics based on the sample transactions
UPDATE suppliers SET 
    total_transactions = (
        SELECT COUNT(*) FROM payment_requests 
        WHERE nha_cung_cap = suppliers.name AND deleted_at IS NULL
    ),
    total_amount = (
        SELECT COALESCE(SUM(so_tien), 0) FROM payment_requests 
        WHERE nha_cung_cap = suppliers.name AND status = 'approved' AND deleted_at IS NULL
    ),
    average_payment_days = (
        SELECT COALESCE(AVG(
            julianday(payment_date) - julianday(approved_at)
        ), 0)
        FROM payment_requests 
        WHERE nha_cung_cap = suppliers.name 
        AND payment_date IS NOT NULL 
        AND approved_at IS NOT NULL 
        AND deleted_at IS NULL
    )
WHERE EXISTS (
    SELECT 1 FROM payment_requests 
    WHERE nha_cung_cap = suppliers.name AND deleted_at IS NULL
);

-- =============================================================================
-- REFRESH VIEWS AND OPTIMIZE
-- =============================================================================

-- Refresh the FTS index with sample data
DELETE FROM payment_requests_fts;
INSERT INTO payment_requests_fts(rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem)
SELECT rowid, so, nguoi_de_nghi, bo_phan, noi_dung_thanh_toan, nha_cung_cap, so_pr, chung_tu_dinh_kem
FROM payment_requests
WHERE deleted_at IS NULL;

-- Update statistics for better query planning
ANALYZE;

-- =============================================================================
-- COMPLETION SUMMARY
-- =============================================================================

SELECT 
    'Sample data loaded successfully!' as message,
    (SELECT COUNT(*) FROM users WHERE id != 'admin_default') as sample_users,
    (SELECT COUNT(*) FROM suppliers) as total_suppliers,
    (SELECT COUNT(*) FROM payment_requests) as sample_requests,
    (SELECT COUNT(*) FROM payment_details) as sample_details,
    (SELECT COUNT(*) FROM workflow_history) as workflow_entries,
    (SELECT COUNT(*) FROM ai_insights) as ai_insights,
    (SELECT COUNT(*) FROM ml_training_data) as training_samples,
    datetime('now') as loaded_at;