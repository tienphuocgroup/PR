import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileText, X, Upload, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  required?: boolean;
  accept?: string;
  maxFiles?: number;
}

export function FileUpload({
  form,
  name,
  label,
  required = false,
  accept = 'application/pdf',
  maxFiles = 5,
}: FileUploadProps) {
  const { setValue, watch } = form;
  const files = watch(name) || [];
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
        .filter(file => file.type === 'application/pdf');
      
      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
        setValue(name, updatedFiles, { shouldValidate: true });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setValue(name, updatedFiles, { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setValue(name, updatedFiles.length > 0 ? updatedFiles : [], { shouldValidate: true });
  };

  const openPdfPreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
          dragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-upload-${name}`)?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Kéo và thả file PDF vào đây hoặc <span className="text-blue-600 font-medium">chọn file</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Chỉ chấp nhận file PDF (tối đa {maxFiles} file)
        </p>
        <input
          id={`file-upload-${name}`}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Tài liệu đính kèm:</p>
          {files.map((file: File, index: number) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm truncate max-w-[200px] md:max-w-xs">
                  {file.name}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => openPdfPreview(file)}
                  className="p-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Xem trước"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Xóa"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}