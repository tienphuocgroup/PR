import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configure pdfmake to use Roboto font from vfs_fonts (for Unicode support)
pdfMake.vfs = pdfFonts as any;
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf', // pdfmake's vfs_fonts often uses Medium for Bold
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf' // and MediumItalic for BoldItalic
  }
};
import { PaymentRequest } from '../types';
import { getModernPaymentRequestDocDefinition } from './modernPdf';
import { loadImageAsBase64 } from './imageUtils';

export interface PDFGenerationOptions {
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  showWatermark?: boolean;
  filename?: string;
  // metadata, title, author, subject, keywords were removed as they were not used
}

export class ModernPDFService {
  /**
   * Generate PDF blob from payment request data
   */
  static async generatePDFBlob(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<Blob> {
    const {
      status = 'draft',
      showWatermark = false,
    } = options;

    try {
      // Load the logo as base64
      const tpgLogoBase64 = await loadImageAsBase64('/tpg-logo.png');
      const docDefinition = getModernPaymentRequestDocDefinition(data, { status, showWatermark, images: { tpgLogo: tpgLogoBase64 } });
      return await new Promise<Blob>((resolve, reject) => {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Không thể tạo PDF.'));
        });
      });
    } catch (error) {
      console.error('Error generating modern PDF:', error);
      throw new Error('Lỗi tạo PDF blob sau khi bắt lỗi nội bộ.');
    }
  }

  /**
   * Download PDF file
   */
  static async downloadPDF(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = `payment-request-${data.so || 'draft'}-${new Date().toISOString().split('T')[0]}.pdf`
    } = options;

    try {
      const blob = await this.generatePDFBlob(data, options);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Không thể tải xuống PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Print PDF directly
   */
  static async printPDF(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.generatePDFBlob(data, options);
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        throw new Error('Popup blocked');
      }
      
      // Cleanup after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw new Error('Không thể in PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Get PDF as base64 string (useful for email attachments)
   */
  static async getPDFBase64(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<string> {
    try {
      const blob = await this.generatePDFBlob(data, options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting PDF to base64:', error);
      throw new Error('Không thể chuyển đổi PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Share PDF via Web Share API (if supported)
   */
  static async sharePDF(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    if (!navigator.share) {
      throw new Error('Trình duyệt không hỗ trợ chia sẻ.');
    }

    try {
      const blob = await this.generatePDFBlob(data, options);
      const filename = options.filename || `payment-request-${data.so || 'draft'}.pdf`;
      
      const file = new File([blob], filename, { type: 'application/pdf' });
      
      await navigator.share({
        title: 'Phiếu Đề Nghị Thanh Toán',
        text: `Phiếu đề nghị thanh toán - ${data.noiDungThanhToan}`,
        files: [file],
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw new Error('Không thể chia sẻ PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Preview PDF in new tab
   */
  static async previewPDF(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    try {
      const blob = await this.generatePDFBlob(data, options);
      const url = URL.createObjectURL(blob);
      
      const previewWindow = window.open(url, '_blank');
      if (!previewWindow) {
        throw new Error('Popup blocked');
      }
      
      // Cleanup when window is closed
      previewWindow.onbeforeunload = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw new Error('Không thể xem trước PDF. Vui lòng thử lại.');
    }
  }

  /**
   * Validate payment request data before PDF generation
   */
  static validatePaymentRequest(data: PaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nguoiDeNghi?.trim()) {
      errors.push('Tên người đề nghị không được để trống');
    }

    if (!data.boPhan?.trim()) {
      errors.push('Bộ phận không được để trống');
    }

    if (!data.noiDungThanhToan?.trim()) {
      errors.push('Nội dung thanh toán không được để trống');
    }

    if (!data.nhaCungCap?.trim()) {
      errors.push('Nhà cung cấp không được để trống');
    }

    if (!data.soTien || data.soTien <= 0) {
      errors.push('Số tiền phải lớn hơn 0');
    }

    if (!data.ngay) {
      errors.push('Ngày không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get PDF file size estimate
   */
  static async getPDFSize(
    data: PaymentRequest, 
    options: PDFGenerationOptions = {}
  ): Promise<number> {
    try {
      const blob = await this.generatePDFBlob(data, options);
      return blob.size;
    } catch (error) {
      console.error('Error getting PDF size:', error);
      return 0;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export default instance for convenience
export const pdfService = ModernPDFService; 