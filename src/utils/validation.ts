import { z } from 'zod';

export const paymentDetailSchema = z.object({
  stt: z.number().min(1, 'STT phải lớn hơn 0'),
  dienGiai: z.string().min(1, 'Diễn giải không được để trống'),
  soLuong: z.number().min(0, 'Số lượng không được âm'),
  donVi: z.string().min(1, 'Đơn vị không được để trống'),
  donGia: z.number().min(0, 'Đơn giá không được âm'),
  thanhTien: z.number().min(0, 'Thành tiền không được âm')
});

export const paymentRequestSchema = z.object({
  so: z.string().optional(),
  ngay: z.string().min(1, 'Ngày không được để trống'),
  soPR: z.string().optional(),
  nguoiDeNghi: z.string().min(1, 'Người đề nghị không được để trống'),
  boPhan: z.string().min(1, 'Bộ phận không được để trống'),
  nganSach: z.enum(['Hoạt động', 'Dự án']).optional(),
  maKhoanMuc: z.string().optional(),
  keHoachChi: z.enum(['Trong KH', 'Ngoài KH']).optional(),
  noiDungThanhToan: z.string().min(1, 'Nội dung thanh toán không được để trống'),
  nhaCungCap: z.string().min(1, 'Nhà cung cấp không được để trống'),
  soTien: z.number().min(0, 'Số tiền không được âm').nonnegative(),
  bangChu: z.string().optional(),
  ngayDenHan: z.string().optional(),
  chungTuDinhKem: z.string().optional(),
  chiTiet: z.array(paymentDetailSchema).optional(),
  attachments: z.array(
    z.instanceof(File).refine(
      (file) => file.type === 'application/pdf',
      { message: 'Chỉ hỗ trợ file PDF' }
    )
  ).optional()
});