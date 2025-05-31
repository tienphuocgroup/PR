import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, FileText } from 'lucide-react';
import Cookies from 'js-cookie';
import { FormField } from './ui/FormField';
import { FileUpload } from './ui/FileUpload';
import { DetailTable } from './DetailTable';
import { ModernPDFActions } from './ModernPDFActions';
import { PaymentRequest } from '../types';
import { paymentRequestSchema } from '../utils/validation';
import { formatCurrency, numberToCurrencyText } from '../utils/formatters';

const COOKIE_KEY = 'paymentRequestFormData';

// Default values for the form
const defaultValues: Partial<PaymentRequest> = {
  ngay: new Date().toISOString().split('T')[0],
  nguoiDeNghi: 'Nguyễn Minh Luân',
  boPhan: 'Công Nghệ Ứng Dụng',
  nganSach: 'Hoạt động',
  keHoachChi: 'Trong KH',
  noiDungThanhToan: 'Thanh toán chi phí phần mềm và dịch vụ công nghệ thông tin',
  nhaCungCap: 'Công ty TNHH Công Nghệ ABC',
  soTien: 5000000,
  chiTiet: [
    {
      stt: 1,
      dienGiai: 'Phí bản quyền phần mềm',
      soLuong: 1,
      donVi: 'Gói',
      donGia: 3000000,
      thanhTien: 3000000
    },
    {
      stt: 2,
      dienGiai: 'Phí dịch vụ triển khai',
      soLuong: 1,
      donVi: 'Gói',
      donGia: 2000000,
      thanhTien: 2000000
    }
  ]
};

export function PaymentRequestForm() {
  const form = useForm<PaymentRequest>({
    resolver: zodResolver(paymentRequestSchema),
    defaultValues
  });

  const { handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = form;
  const soTien = watch('soTien');
  const watchedData = watch(); // Watch all form data for PDF generation

  // Load saved form data from cookies
  useEffect(() => {
    const savedData = Cookies.get(COOKIE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        reset(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, [reset]);

  // Update "bangChu" when "soTien" changes
  useEffect(() => {
    if (soTien) {
      setValue('bangChu', numberToCurrencyText(soTien));
    } else {
      setValue('bangChu', '');
    }
  }, [soTien, setValue]);

  const [jsonInput, setJsonInput] = useState('');

  const handleApplyJson = () => {
    if (!jsonInput.trim()) {
      alert('Vui lòng nhập dữ liệu JSON.');
      return;
    }
    try {
      const parsedJson = JSON.parse(jsonInput);
      if (!Array.isArray(parsedJson)) {
        alert('Dữ liệu JSON đầu vào phải là một mảng (array).');
        return;
      }

      const newDetails = parsedJson.map((item: any, index: number) => {
        if (
          typeof item.description !== 'string' ||
          typeof item.quantity !== 'number' ||
          item.quantity <= 0 ||
          typeof item.amount !== 'number' ||
          item.amount < 0
        ) {
          throw new Error(
            `Mục không hợp lệ ở vị trí ${index + 1}: \"description\" (chuỗi), \"quantity\" (số dương), \"amount\" (số không âm) là bắt buộc.`
          );
        }

        return {
          stt: index + 1,
          dienGiai: item.description,
          soLuong: item.quantity,
          donVi: item.donVi || 'Post', // Allow "donVi" from JSON or default to "Post"
          donGia: item.quantity !== 0 ? item.amount / item.quantity : 0,
          thanhTien: item.amount,
        };
      });

      setValue('chiTiet', newDetails, { shouldValidate: true, shouldDirty: true });

      const totalAmount = newDetails.reduce((sum, detail) => sum + (detail.thanhTien || 0), 0);
      setValue('soTien', totalAmount, { shouldValidate: true, shouldDirty: true });

      alert('Bảng chi tiết đã được cập nhật thành công từ JSON!');
      // setJsonInput(''); // Optionally clear input, or leave for re-editing
    } catch (error) {
      console.error('Lỗi xử lý JSON:', error);
      alert(`Lỗi xử lý JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const onSubmit = async (data: PaymentRequest) => {
    try {
      // Save form data to cookies (excluding file attachments)
      const dataToSave = { ...data };
      delete dataToSave.attachments;
      Cookies.set(COOKIE_KEY, JSON.stringify(dataToSave), { expires: 7 });

      // Show success message
      alert('Dữ liệu đã được lưu thành công! Bạn có thể tạo PDF bằng các nút bên dưới.');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-100">
            <h2 className="text-xl font-medium text-blue-900">Phiếu Đề Nghị Thanh Toán</h2>
          </div>

          <div className="p-6">
            {/* Row 1: Số, Ngày, Số PR */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <FormField
                form={form}
                name="so"
                label="Số"
              />
              <FormField
                form={form}
                name="ngay"
                label="Ngày"
                type="date"
                required
              />
              <FormField
                form={form}
                name="soPR"
                label="Số PR"
              />
            </div>

            {/* Row 2: Người đề nghị, Bộ phận */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField
                form={form}
                name="nguoiDeNghi"
                label="Người đề nghị"
                required
              />
              <FormField
                form={form}
                name="boPhan"
                label="Bộ phận"
                required
              />
            </div>

            {/* Row 3: Ngân sách, Mã khoản mục, Kế hoạch chi */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <FormField
                form={form}
                name="nganSach"
                label="Ngân sách sử dụng"
                type="select"
                options={[
                  { value: 'Hoạt động', label: 'Hoạt động' },
                  { value: 'Dự án', label: 'Dự án' }
                ]}
              />
              <FormField
                form={form}
                name="maKhoanMuc"
                label="Mã khoản mục NS"
              />
              <FormField
                form={form}
                name="keHoachChi"
                label="Kế hoạch chi hàng tháng"
                type="select"
                options={[
                  { value: 'Trong KH', label: 'Trong KH' },
                  { value: 'Ngoài KH', label: 'Ngoài KH' }
                ]}
              />
            </div>

            {/* Row 4: Nội dung thanh toán */}
            <div className="mb-4">
              <FormField
                form={form}
                name="noiDungThanhToan"
                label="Nội dung thanh toán"
                type="textarea"
                required
              />
            </div>

            {/* Row 5: Nhà cung cấp */}
            <div className="mb-4">
              <FormField
                form={form}
                name="nhaCungCap"
                label="Nhà thầu/ NCC / Đối tác"
                required
              />
            </div>

            {/* Row 6: Số tiền, Bằng chữ */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <FormField
                  form={form}
                  name="soTien"
                  label="Số tiền (VNĐ)"
                  type="number"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {soTien ? formatCurrency(soTien) : '0 ₫'}
                </p>
              </div>
              <FormField
                form={form}
                name="bangChu"
                label="Bằng chữ"
                className="pointer-events-none bg-gray-50"
              />
            </div>

            {/* Row 7: Ngày đến hạn, Chứng từ đính kèm */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField
                form={form}
                name="ngayDenHan"
                label="Ngày đến hạn thanh toán"
                type="date"
              />
              <FormField
                form={form}
                name="chungTuDinhKem"
                label="Chứng từ đính kèm"
              />
            </div>

            {/* JSON Input for Payment Details */}
            <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-slate-50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Nhập chi tiết từ JSON
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Dán nội dung JSON vào ô bên dưới để tự động điền bảng chi tiết. Mỗi mục trong JSON sẽ tạo một hàng mới.
              </p>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono placeholder-gray-400"
                rows={10}
                placeholder={'[\n  {\n    "description": "Tên sản phẩm/dịch vụ",\n    "quantity": 1,\n    "unit_price": 100000, // Giá đơn vị (có thể là ngoại tệ nếu amount là VND tương ứng)\n    "currency": "VND",   // Đơn vị tiền tệ của unit_price (ví dụ: \"USD\", \"VND\")\n    "amount": 100000,   // Tổng tiền cuối cùng bằng VND cho mục này\n    "donVi": "Cái"      // (Tùy chọn) Đơn vị tính, ví dụ: Cái, Gói, Lần\n  },\n  {\n    "description": "Sản phẩm khác",\n    "quantity": 2,\n    "unit_price": 25.50,\n    "currency": "USD",\n    "amount": 1200000, // = 2 * 25.50 USD * tỷ giá (ví dụ)\n    "donVi": "Tháng"\n  }\n  // ... thêm các mục khác nếu cần\n]'}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <button
                type="button"
                onClick={handleApplyJson}
                className="mt-3 inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
              >
                Áp dụng JSON vào bảng chi tiết
              </button>
            </div>

            {/* Payment Details Table */}
            <DetailTable form={form} />

            {/* File Upload Section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <FileUpload
                form={form}
                name="attachments"
                label="Tài liệu đính kèm (PDF)"
                accept="application/pdf"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
            </button>
          </div>
        </div>
      </form>

      {/* Modern PDF Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <h3 className="text-lg font-medium text-blue-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Tạo và Xuất PDF
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Sử dụng các tùy chọn bên dưới để tạo PDF với định dạng hiện đại và font Unicode
          </p>
        </div>
        <div className="p-6">
          <ModernPDFActions 
            data={watchedData as PaymentRequest} 
            variant="default"
          />
        </div>
      </div>
    </div>
  );
}