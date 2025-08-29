import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // First pass: DOMPurify sanitization
  const purified = DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  });
  
  // Second pass: Remove any remaining dangerous patterns
  let sanitized = purified
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '')   // Remove vbscript: protocol  
    .replace(/data:text\/html/gi, '') // Remove data:text/html
    .replace(/on\w+\s*=/gi, '')   // Remove any on* event handlers
    .replace(/<script/gi, '')     // Remove any remaining script tags
    .replace(/<\/script>/gi, '')  // Remove any remaining script closing tags
    .replace(/alert\s*\(/gi, '')  // Remove alert calls
    .replace(/eval\s*\(/gi, '')   // Remove eval calls
    .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
    
  return sanitized;
};

export const validateJsonInput = (input: string): { isValid: boolean; data?: unknown; error?: string } => {
  try {
    const sanitized = sanitizeInput(input);
    const parsed = JSON.parse(sanitized);
    
    if (!Array.isArray(parsed)) {
      return { isValid: false, error: 'JSON phải là một mảng' };
    }
    
    const isValidStructure = parsed.every(item => 
      typeof item === 'object' &&
      item !== null &&
      typeof item.description === 'string' &&
      typeof item.quantity === 'number' &&
      typeof item.amount === 'number' &&
      item.description.length <= 500 &&
      item.quantity >= 0 && item.quantity <= 999999 &&
      item.amount >= 0 && item.amount <= 999999999
    );
    
    if (!isValidStructure) {
      return { isValid: false, error: 'Cấu trúc JSON không hợp lệ. Mỗi item phải có description (string ≤500 ký tự), quantity (số 0-999999), amount (số 0-999999999)' };
    }
    
    return { isValid: true, data: parsed };
  } catch {
    return { isValid: false, error: 'JSON không hợp lệ - kiểm tra cú pháp' };
  }
};

export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  // Size check (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File quá lớn (tối đa 10MB)' };
  }
  
  // MIME type check
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Chỉ chấp nhận file PDF' };
  }
  
  // File name validation - allow Vietnamese characters and safe symbols
  const allowedChars = /^[a-zA-ZÀ-ỹ0-9\s\-_.()]+$/;
  if (!allowedChars.test(file.name)) {
    return { isValid: false, error: 'Tên file chứa ký tự không hợp lệ' };
  }
  
  return { isValid: true };
};

export const sanitizeFormField = (value: string | undefined): string => {
  if (!value || typeof value !== 'string') return '';
  
  // Sanitize input and limit length to prevent abuse
  const sanitized = sanitizeInput(value);
  return sanitized.length > 1000 ? sanitized.slice(0, 1000) : sanitized;
};