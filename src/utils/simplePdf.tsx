import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PaymentRequest } from '../types';
import { formatDate, formatCurrency } from './formatters';

// Simple styles using only built-in fonts
const simpleStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#000000',
  },
  
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  
  section: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #cccccc',
  },
  
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  
  label: {
    width: 150,
    fontWeight: 'bold',
  },
  
  value: {
    flex: 1,
  },
  
  table: {
    marginTop: 10,
    border: '1px solid #000000',
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1px solid #cccccc',
  },
  
  col1: { width: '10%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '35%' },
});

interface SimplePaymentRequestPDFProps {
  data: PaymentRequest;
}

export function SimplePaymentRequestPDF({ data }: SimplePaymentRequestPDFProps) {
  return (
    <Document>
      <Page size="A4" style={simpleStyles.page}>
        <Text style={simpleStyles.title}>PHIẾU ĐỀ NGHỊ THANH TOÁN</Text>
        
        <View style={simpleStyles.section}>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Số:</Text>
            <Text style={simpleStyles.value}>{data.so || 'Chưa có số'}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Ngày:</Text>
            <Text style={simpleStyles.value}>{formatDate(data.ngay)}</Text>
          </View>
          {data.soPR && (
            <View style={simpleStyles.row}>
              <Text style={simpleStyles.label}>Số PR:</Text>
              <Text style={simpleStyles.value}>{data.soPR}</Text>
            </View>
          )}
        </View>
        
        <View style={simpleStyles.section}>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Người đề nghị:</Text>
            <Text style={simpleStyles.value}>{data.nguoiDeNghi}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Bộ phận:</Text>
            <Text style={simpleStyles.value}>{data.boPhan}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Nội dung thanh toán:</Text>
            <Text style={simpleStyles.value}>{data.noiDungThanhToan}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Nhà cung cấp:</Text>
            <Text style={simpleStyles.value}>{data.nhaCungCap}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Số tiền:</Text>
            <Text style={simpleStyles.value}>{formatCurrency(data.soTien)}</Text>
          </View>
          <View style={simpleStyles.row}>
            <Text style={simpleStyles.label}>Bằng chữ:</Text>
            <Text style={simpleStyles.value}>{data.bangChu}</Text>
          </View>
        </View>
        
        {/* Payment Details Table */}
        {data.chiTiet && data.chiTiet.length > 0 && (
          <View style={simpleStyles.section}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
              Chi tiết thanh toán:
            </Text>
            <View style={simpleStyles.table}>
              <View style={simpleStyles.tableHeader}>
                <Text style={simpleStyles.col1}>STT</Text>
                <Text style={simpleStyles.col2}>Diễn giải</Text>
                <Text style={simpleStyles.col3}>Số lượng</Text>
                <Text style={simpleStyles.col4}>Thành tiền</Text>
              </View>
              
              {data.chiTiet.map((item, index) => (
                <View key={index} style={simpleStyles.tableRow}>
                  <Text style={simpleStyles.col1}>{item.stt}</Text>
                  <Text style={simpleStyles.col2}>{item.dienGiai}</Text>
                  <Text style={simpleStyles.col3}>{item.soLuong}</Text>
                  <Text style={simpleStyles.col4}>{formatCurrency(item.thanhTien)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={{ marginTop: 30, textAlign: 'center', fontSize: 10 }}>
          <Text>Tạo bởi hệ thống quản lý thanh toán - {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  );
} 