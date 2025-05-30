import React, { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { PaymentRequest } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DetailTableProps {
  form: UseFormReturn<PaymentRequest>;
}

export function DetailTable({ form }: DetailTableProps) {
  const { control, register, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'chiTiet',
  });

  const watchFieldArray = watch('chiTiet');
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  // Calculate total amount whenever detail items change
  useEffect(() => {
    if (watchFieldArray) {
      const total = watchFieldArray.reduce((sum, item) => {
        return sum + (item.thanhTien || 0);
      }, 0);
      setValue('soTien', total);
    }
  }, [watchFieldArray, setValue]);

  // Calculate line item total when quantity or price changes
  const calculateLineTotal = (index: number) => {
    const quantity = watchFieldArray[index]?.soLuong || 0;
    const price = watchFieldArray[index]?.donGia || 0;
    const total = quantity * price;
    setValue(`chiTiet.${index}.thanhTien`, total);
  };

  const addNewRow = () => {
    append({
      stt: fields.length + 1,
      dienGiai: '',
      soLuong: 1,
      donVi: '',
      donGia: 0,
      thanhTien: 0
    });
  };

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">Chi tiết thanh toán</h3>
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          onClick={addNewRow}
        >
          <Plus className="h-4 w-4 mr-1" />
          Thêm dòng
        </button>
      </div>
      
      <div className="min-w-full shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diễn giải</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {controlledFields.map((field, index) => (
              <tr key={field.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    className="w-12 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register(`chiTiet.${index}.stt` as const, {
                      valueAsNumber: true
                    })}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register(`chiTiet.${index}.dienGiai` as const)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register(`chiTiet.${index}.soLuong` as const, {
                      valueAsNumber: true,
                      onChange: () => calculateLineTotal(index)
                    })}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register(`chiTiet.${index}.donVi` as const)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="number"
                    className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register(`chiTiet.${index}.donGia` as const, {
                      valueAsNumber: true,
                      onChange: () => calculateLineTotal(index)
                    })}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(watchFieldArray[index]?.thanhTien || 0)}
                  <input
                    type="hidden"
                    {...register(`chiTiet.${index}.thanhTien` as const, {
                      valueAsNumber: true
                    })}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-900 focus:outline-none"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  Chưa có dữ liệu chi tiết. Nhấn "Thêm dòng" để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                Tổng cộng:
              </td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                {formatCurrency(watch('soTien') || 0)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}