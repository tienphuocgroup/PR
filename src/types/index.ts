export interface PaymentRequest {
  so: string;
  ngay: string;
  soPR?: string;
  nguoiDeNghi: string;
  boPhan: string;
  nganSach?: 'Hoạt động' | 'Dự án';
  maKhoanMuc?: string;
  keHoachChi?: 'Trong KH' | 'Ngoài KH';
  noiDungThanhToan: string;
  nhaCungCap: string;
  soTien: number;
  bangChu: string;
  ngayDenHan: string;
  chungTuDinhKem?: string;
  chiTiet?: PaymentDetail[];
  attachments?: File[];
}

export interface PaymentDetail {
  stt: number;
  dienGiai: string;
  soLuong: number;
  donVi: string;
  donGia: number;
  thanhTien: number;
}