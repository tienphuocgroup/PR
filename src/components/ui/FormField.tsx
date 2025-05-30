import React from 'react';
import { Controller, UseFormReturn, Path, FieldValues } from 'react-hook-form';
import { cn } from '../../utils/cn';

interface FormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
}

export function FormField<T extends FieldValues>({
  form,
  name,
  label,
  type = 'text',
  placeholder = '',
  required = false,
  options = [],
  className = '',
}: FormFieldProps<T>) {
  const { control, formState: { errors } } = form;
  const errorMessage = errors[name]?.message as string;

  return (
    <div className={cn('mb-4', className)}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          if (type === 'select') {
            return (
              <select
                id={name}
                {...field}
                className={cn(
                  'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200',
                  errorMessage ? 'border-red-500' : ''
                )}
              >
                <option value="">Chọn {label.toLowerCase()}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          if (type === 'textarea') {
            return (
              <textarea
                id={name}
                {...field}
                placeholder={placeholder}
                className={cn(
                  'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200',
                  errorMessage ? 'border-red-500' : ''
                )}
                rows={4}
              />
            );
          }

          return (
            <input
              id={name}
              type={type}
              {...field}
              placeholder={placeholder}
              className={cn(
                'mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200',
                errorMessage ? 'border-red-500' : ''
              )}
              value={field.value || (type === 'number' ? '' : field.value)}
              onChange={(e) => {
                if (type === 'number') {
                  const value = e.target.value === '' ? '' : Number(e.target.value);
                  field.onChange(value);
                } else {
                  field.onChange(e);
                }
              }}
            />
          );
        }}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}