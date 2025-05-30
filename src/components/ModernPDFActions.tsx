import React, { useState } from 'react';
import { 
  Download, 
  Eye, 
  Printer, 
  Share2, 
  FileText, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PaymentRequest } from '../types';
import { ModernPDFService, PDFGenerationOptions } from '../utils/pdfService';

interface ModernPDFActionsProps {
  data: PaymentRequest;
  className?: string;
  variant?: 'default' | 'compact' | 'dropdown';
}

export function ModernPDFActions({ 
  data, 
  className = '', 
  variant = 'default' 
}: ModernPDFActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [pdfOptions, setPdfOptions] = useState<PDFGenerationOptions>({
    status: 'draft',
    showWatermark: false,
  });

  const handlePDFAction = async (
    action: 'preview' | 'download' | 'print' | 'share',
    options?: PDFGenerationOptions
  ) => {
    setIsLoading(true);
    setLastAction(action);

    try {
      // Validate data first
      const validation = ModernPDFService.validatePaymentRequest(data);
      if (!validation.isValid) {
        alert(`Dữ liệu không hợp lệ:\n${validation.errors.join('\n')}`);
        return;
      }

      const finalOptions = { ...pdfOptions, ...options };

      switch (action) {
        case 'preview':
          await ModernPDFService.previewPDF(data, finalOptions);
          break;
        case 'download':
          await ModernPDFService.downloadPDF(data, finalOptions);
          break;
        case 'print':
          await ModernPDFService.printPDF(data, finalOptions);
          break;
        case 'share':
          await ModernPDFService.sharePDF(data, finalOptions);
          break;
      }
    } catch (error) {
      console.error(`Error with ${action}:`, error);
      alert(error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  };

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    action, 
    variant: buttonVariant = 'secondary',
    disabled = false 
  }: {
    icon: React.ComponentType<any>;
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
  }) => {
    const baseClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
    };

    return (
      <button
        onClick={action}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[buttonVariant]}`}
      >
        {isLoading && lastAction === label.toLowerCase() ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        {label}
      </button>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <ActionButton
          icon={Eye}
          label="Xem trước"
          action={() => handlePDFAction('preview')}
          variant="outline"
        />
        <ActionButton
          icon={Download}
          label="Tải xuống"
          action={() => handlePDFAction('download')}
          variant="primary"
        />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FileText className="h-4 w-4 mr-2" />
          Tạo PDF
          <Settings className="h-4 w-4 ml-2" />
        </button>

        {showOptions && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tùy chọn PDF</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={pdfOptions.status}
                    onChange={(e) => setPdfOptions(prev => ({ 
                      ...prev, 
                      status: e.target.value as any 
                    }))}
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={pdfOptions.showWatermark}
                    onChange={(e) => setPdfOptions(prev => ({ 
                      ...prev, 
                      showWatermark: e.target.checked 
                    }))}
                    className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="watermark" className="ml-2 text-xs text-gray-700">
                    Hiển thị watermark
                  </label>
                </div>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handlePDFAction('preview');
                    setShowOptions(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Xem trước
                </button>
                
                <button
                  onClick={() => {
                    handlePDFAction('download');
                    setShowOptions(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Download className="h-3 w-3 mr-2" />
                  Tải xuống
                </button>
                
                <button
                  onClick={() => {
                    handlePDFAction('print');
                    setShowOptions(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Printer className="h-3 w-3 mr-2" />
                  In
                </button>
                
                <button
                  onClick={() => {
                    handlePDFAction('share');
                    setShowOptions(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Share2 className="h-3 w-3 mr-2" />
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      {/* PDF Options */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Tùy chọn PDF
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái phiếu
            </label>
            <select
              value={pdfOptions.status}
              onChange={(e) => setPdfOptions(prev => ({ 
                ...prev, 
                status: e.target.value as any 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="draft">Bản nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="watermark-default"
              checked={pdfOptions.showWatermark}
              onChange={(e) => setPdfOptions(prev => ({ 
                ...prev, 
                showWatermark: e.target.checked 
              }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="watermark-default" className="ml-2 text-sm text-gray-700">
              Hiển thị watermark trạng thái
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <ActionButton
          icon={Eye}
          label="Xem trước PDF"
          action={() => handlePDFAction('preview')}
          variant="outline"
        />
        
        <ActionButton
          icon={Download}
          label="Tải xuống PDF"
          action={() => handlePDFAction('download')}
          variant="primary"
        />
        
        <ActionButton
          icon={Printer}
          label="In PDF"
          action={() => handlePDFAction('print')}
          variant="secondary"
        />
        
        {navigator.share && typeof navigator.share === 'function' && (
          <ActionButton
            icon={Share2}
            label="Chia sẻ PDF"
            action={() => handlePDFAction('share')}
            variant="secondary"
          />
        )}
      </div>

      {/* Status Messages */}
      {isLoading && (
        <div className="flex items-center text-sm text-blue-600">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Đang xử lý PDF...
        </div>
      )}
    </div>
  );
}

// Export a simple hook for PDF actions
export function usePDFActions(data: PaymentRequest) {
  const [isLoading, setIsLoading] = useState(false);

  const executeAction = async (
    action: 'preview' | 'download' | 'print' | 'share',
    options?: PDFGenerationOptions
  ) => {
    setIsLoading(true);
    try {
      const validation = ModernPDFService.validatePaymentRequest(data);
      if (!validation.isValid) {
        throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
      }

      switch (action) {
        case 'preview':
          await ModernPDFService.previewPDF(data, options);
          break;
        case 'download':
          await ModernPDFService.downloadPDF(data, options);
          break;
        case 'print':
          await ModernPDFService.printPDF(data, options);
          break;
        case 'share':
          await ModernPDFService.sharePDF(data, options);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    preview: (options?: PDFGenerationOptions) => executeAction('preview', options),
    download: (options?: PDFGenerationOptions) => executeAction('download', options),
    print: (options?: PDFGenerationOptions) => executeAction('print', options),
    share: (options?: PDFGenerationOptions) => executeAction('share', options),
  };
} 