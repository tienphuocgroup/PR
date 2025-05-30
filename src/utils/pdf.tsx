import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { PaymentRequest } from '../types';
import { formatDate, formatCurrency } from './formatters';

// React-PDF font registration
import NotoSans400 from '@fontsource/noto-sans/files/noto-sans-latin-ext-400-normal.woff';
import NotoSans700 from '@fontsource/noto-sans/files/noto-sans-latin-ext-700-normal.woff';

Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: NotoSans400, fontWeight: 'normal' },
    { src: NotoSans700, fontWeight: 'bold' }
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Noto Sans',
    fontSize: 11,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    width: 160,
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 11,
  },
  value: { flex: 1 },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
});

/* PDF component with complete JSX structure */
export function PaymentRequestPDF({ data }: { data: PaymentRequest }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Payment Request</Text>
        
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Số:</Text>
            <Text style={styles.value}>{data.so}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày:</Text>
            <Text style={styles.value}>{formatDate(data.ngay)}</Text>
          </View>
          {data.soPR && (
            <View style={styles.row}>
              <Text style={styles.label}>Số PR:</Text>
              <Text style={styles.value}>{data.soPR}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Người đề nghị:</Text>
            <Text style={styles.value}>{data.nguoiDeNghi}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bộ phận:</Text>
            <Text style={styles.value}>{data.boPhan}</Text>
          </View>
          {data.nganSach && (
            <View style={styles.row}>
              <Text style={styles.label}>Ngân sách:</Text>
              <Text style={styles.value}>{data.nganSach}</Text>
            </View>
          )}
          {data.maKhoanMuc && (
            <View style={styles.row}>
              <Text style={styles.label}>Mã khoản mục:</Text>
              <Text style={styles.value}>{data.maKhoanMuc}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Nội dung thanh toán:</Text>
            <Text style={styles.value}>{data.noiDungThanhToan}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nhà cung cấp:</Text>
            <Text style={styles.value}>{data.nhaCungCap}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Số tiền:</Text>
            <Text style={[styles.value, styles.amount]}>{formatCurrency(data.soTien)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bằng chữ:</Text>
            <Text style={styles.value}>{data.bangChu}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ngày đến hạn:</Text>
            <Text style={styles.value}>{formatDate(data.ngayDenHan)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated on {formatDate(new Date().toISOString())}
        </Text>
      </Page>
    </Document>
  );
}