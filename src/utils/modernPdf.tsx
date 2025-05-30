import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { PaymentRequest } from '../types';
import { formatDate, formatCurrency } from './formatters';

// Register fonts with built-in fallback
let fontFamilyToUse = 'Helvetica'; // Default to built-in font

try {
  // Try to register Noto Sans
  Font.register({
    family: 'Noto Sans',
    fonts: [
      {
        src: 'https://fonts.gstatic.com/s/notosans/v30/o-0IIpQlx3QUlC5A4PNr5TRA.woff2',
        fontWeight: 'normal',
      },
      {
        src: 'https://fonts.gstatic.com/s/notosans/v30/o-0NIpQlx3QUlC5A4PNjXhFlY9aA.woff2',
        fontWeight: 'bold',
      },
    ],
  });
  fontFamilyToUse = 'Noto Sans';
  console.log('Noto Sans fonts registered successfully');
} catch (error) {
  console.warn('Using Helvetica fallback font:', error);
}

const modernStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: fontFamilyToUse,
    fontSize: 12,
    lineHeight: 1.6,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  
  // Header styles
  header: {
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    borderBottomStyle: 'solid',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: 8,
    fontFamily: fontFamilyToUse,
  },
  
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  
  // Document info section
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  documentInfoLeft: {
    flex: 1,
  },
  
  documentInfoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  // Section styles
  section: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    fontFamily: fontFamilyToUse,
  },
  
  // Field styles
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  
  fieldLabel: {
    width: 180,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4b5563',
    paddingRight: 15,
  },
  
  fieldValue: {
    flex: 1,
    fontSize: 12,
    color: '#1f2937',
    lineHeight: 1.5,
  },
  
  // Special field styles
  amountField: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'right',
    fontFamily: fontFamilyToUse,
  },
  
  currencyText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  // Table styles
  table: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    fontFamily: fontFamilyToUse,
  },
  
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  tableCell: {
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Column widths for table
  col1: { width: '8%' },   // STT
  col2: { width: '35%' },  // Diễn giải
  col3: { width: '12%' },  // Số lượng
  col4: { width: '15%' },  // Đơn vị
  col5: { width: '15%' },  // Đơn giá
  col6: { width: '15%' },  // Thành tiền
  
  // Footer styles
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  footerLeft: {
    fontSize: 10,
    color: '#6b7280',
  },
  
  footerRight: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  
  // Signature section
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  signatureBox: {
    width: '30%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 30,
    textAlign: 'center',
  },
  
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#d1d5db',
    marginBottom: 8,
  },
  
  signatureDate: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Status badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  
  statusText: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: 'bold',
    fontFamily: fontFamilyToUse,
  },
  
  // Watermark
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f3f4f6',
    fontWeight: 'bold',
    opacity: 0.1,
    zIndex: -1,
  },
});

interface ModernPaymentRequestPDFProps {
  data: PaymentRequest;
  showWatermark?: boolean;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export function ModernPaymentRequestPDF({ 
  data, 
  showWatermark = false, 
  status = 'draft' 
}: ModernPaymentRequestPDFProps) {
  const currentDate = new Date().toISOString();
  
  return (
    <Document
      title={`Phiếu Đề Nghị Thanh Toán - ${data.so || 'Draft'}`}
      author={data.nguoiDeNghi}
      subject="Payment Request"
      keywords="payment,request,vietnamese,finance"
      creator="Modern Payment System"
      producer="React-PDF"
    >
      <Page size="A4" style={modernStyles.page}>
        {/* Watermark */}
        {showWatermark && (
          <Text style={modernStyles.watermark}>
            {status.toUpperCase()}
          </Text>
        )}
        
        {/* Header */}
        <View style={modernStyles.header}>
          <Text style={modernStyles.title}>
            PHIẾU ĐỀ NGHỊ THANH TOÁN
          </Text>
          <Text style={modernStyles.subtitle}>
            Payment Request Form
          </Text>
        </View>
        
        {/* Document Info */}
        <View style={modernStyles.documentInfo}>
          <View style={modernStyles.documentInfoLeft}>
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Số phiếu:</Text>
              <Text style={modernStyles.fieldValue}>{data.so || 'Chưa có số'}</Text>
            </View>
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Ngày tạo:</Text>
              <Text style={modernStyles.fieldValue}>{formatDate(data.ngay)}</Text>
            </View>
            {data.soPR && (
              <View style={modernStyles.fieldRow}>
                <Text style={modernStyles.fieldLabel}>Số PR:</Text>
                <Text style={modernStyles.fieldValue}>{data.soPR}</Text>
              </View>
            )}
          </View>
          <View style={modernStyles.documentInfoRight}>
            <View style={modernStyles.statusBadge}>
              <Text style={modernStyles.statusText}>
                {status === 'draft' && 'BẢN NHÁP'}
                {status === 'pending' && 'CHỜ DUYỆT'}
                {status === 'approved' && 'ĐÃ DUYỆT'}
                {status === 'rejected' && 'TỪ CHỐI'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Requester Information */}
        <View style={modernStyles.section}>
          <Text style={modernStyles.sectionTitle}>
            Thông tin người đề nghị
          </Text>
          <View style={modernStyles.fieldRow}>
            <Text style={modernStyles.fieldLabel}>Họ và tên:</Text>
            <Text style={modernStyles.fieldValue}>{data.nguoiDeNghi}</Text>
          </View>
          <View style={modernStyles.fieldRow}>
            <Text style={modernStyles.fieldLabel}>Bộ phận:</Text>
            <Text style={modernStyles.fieldValue}>{data.boPhan}</Text>
          </View>
          {data.nganSach && (
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Ngân sách sử dụng:</Text>
              <Text style={modernStyles.fieldValue}>{data.nganSach}</Text>
            </View>
          )}
          {data.maKhoanMuc && (
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Mã khoản mục NS:</Text>
              <Text style={modernStyles.fieldValue}>{data.maKhoanMuc}</Text>
            </View>
          )}
          {data.keHoachChi && (
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Kế hoạch chi:</Text>
              <Text style={modernStyles.fieldValue}>{data.keHoachChi}</Text>
            </View>
          )}
        </View>
        
        {/* Payment Information */}
        <View style={modernStyles.section}>
          <Text style={modernStyles.sectionTitle}>
            Thông tin thanh toán
          </Text>
          <View style={modernStyles.fieldRow}>
            <Text style={modernStyles.fieldLabel}>Nội dung thanh toán:</Text>
            <Text style={modernStyles.fieldValue}>{data.noiDungThanhToan}</Text>
          </View>
          <View style={modernStyles.fieldRow}>
            <Text style={modernStyles.fieldLabel}>Nhà thầu/NCC/Đối tác:</Text>
            <Text style={modernStyles.fieldValue}>{data.nhaCungCap}</Text>
          </View>
          <View style={modernStyles.fieldRow}>
            <Text style={modernStyles.fieldLabel}>Số tiền:</Text>
            <View style={{ flex: 1 }}>
              <Text style={modernStyles.amountField}>
                {formatCurrency(data.soTien)}
              </Text>
              <Text style={modernStyles.currencyText}>
                Bằng chữ: {data.bangChu}
              </Text>
            </View>
          </View>
          {data.ngayDenHan && (
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Ngày đến hạn:</Text>
              <Text style={modernStyles.fieldValue}>{formatDate(data.ngayDenHan)}</Text>
            </View>
          )}
          {data.chungTuDinhKem && (
            <View style={modernStyles.fieldRow}>
              <Text style={modernStyles.fieldLabel}>Chứng từ đính kèm:</Text>
              <Text style={modernStyles.fieldValue}>{data.chungTuDinhKem}</Text>
            </View>
          )}
        </View>
        
        {/* Payment Details Table */}
        {data.chiTiet && data.chiTiet.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>
              Chi tiết thanh toán
            </Text>
            <View style={modernStyles.table}>
              {/* Table Header */}
              <View style={modernStyles.tableHeader}>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col1]}>STT</Text>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col2]}>Diễn giải</Text>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col3]}>Số lượng</Text>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col4]}>Đơn vị</Text>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col5]}>Đơn giá</Text>
                <Text style={[modernStyles.tableHeaderCell, modernStyles.col6]}>Thành tiền</Text>
              </View>
              
              {/* Table Rows */}
              {data.chiTiet.map((item, index) => (
                <View key={index} style={modernStyles.tableRow}>
                  <Text style={[modernStyles.tableCell, modernStyles.col1]}>{item.stt}</Text>
                  <Text style={[modernStyles.tableCell, modernStyles.col2, { textAlign: 'left' }]}>
                    {item.dienGiai}
                  </Text>
                  <Text style={[modernStyles.tableCell, modernStyles.col3]}>
                    {item.soLuong.toLocaleString()}
                  </Text>
                  <Text style={[modernStyles.tableCell, modernStyles.col4]}>{item.donVi}</Text>
                  <Text style={[modernStyles.tableCell, modernStyles.col5]}>
                    {formatCurrency(item.donGia)}
                  </Text>
                  <Text style={[modernStyles.tableCell, modernStyles.col6]}>
                    {formatCurrency(item.thanhTien)}
                  </Text>
                </View>
              ))}
              
              {/* Total Row */}
              <View style={[modernStyles.tableRow, { backgroundColor: '#f9fafb' }]}>
                <Text style={[modernStyles.tableCell, modernStyles.col1]}></Text>
                <Text style={[modernStyles.tableCell, modernStyles.col2, { fontWeight: 'bold', textAlign: 'right' }]}>
                  TỔNG CỘNG:
                </Text>
                <Text style={[modernStyles.tableCell, modernStyles.col3]}></Text>
                <Text style={[modernStyles.tableCell, modernStyles.col4]}></Text>
                <Text style={[modernStyles.tableCell, modernStyles.col5]}></Text>
                <Text style={[modernStyles.tableCell, modernStyles.col6, { fontWeight: 'bold', color: '#059669' }]}>
                  {formatCurrency(data.soTien)}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Signature Section */}
        <View style={modernStyles.signatureSection}>
          <View style={modernStyles.signatureBox}>
            <Text style={modernStyles.signatureTitle}>Người đề nghị</Text>
            <View style={modernStyles.signatureLine} />
            <Text style={modernStyles.signatureDate}>
              Ngày: {formatDate(currentDate)}
            </Text>
          </View>
          
          <View style={modernStyles.signatureBox}>
            <Text style={modernStyles.signatureTitle}>Trưởng bộ phận</Text>
            <View style={modernStyles.signatureLine} />
            <Text style={modernStyles.signatureDate}>
              Ngày: ___________
            </Text>
          </View>
          
          <View style={modernStyles.signatureBox}>
            <Text style={modernStyles.signatureTitle}>Phòng Tài chính</Text>
            <View style={modernStyles.signatureLine} />
            <Text style={modernStyles.signatureDate}>
              Ngày: ___________
            </Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={modernStyles.footer}>
          <View style={modernStyles.footerLeft}>
            <Text>Tạo bởi: Hệ thống quản lý thanh toán</Text>
            <Text>Phiên bản: 2.0 - Modern PDF Engine</Text>
          </View>
          <View style={modernStyles.footerRight}>
            <Text>Ngày tạo: {formatDate(currentDate)}</Text>
            <Text>Trang 1/1</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
} 