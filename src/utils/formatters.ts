export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

export const numberToCurrencyText = (num: number): string => {
  if (num === 0) return 'Không đồng';
  
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];

  const toWords = (num: number): string => {
    if (num === 0) return '';
    if (num < 10) return digits[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      return digits[Math.floor(num / 10)] + ' mươi ' + (num % 10 === 0 ? '' : (num % 10 === 1 ? 'mốt' : digits[num % 10]));
    }
    return digits[Math.floor(num / 100)] + ' trăm ' + (num % 100 === 0 ? '' : (num % 100 < 10 ? 'lẻ ' + digits[num % 100] : toWords(num % 100)));
  };

  const numStr = num.toString();
  let result = '';
  let groupIndex = 0;
  
  for (let i = numStr.length; i > 0; i -= 3) {
    const group = parseInt(numStr.substring(Math.max(0, i - 3), i), 10);
    if (group !== 0) {
      result = toWords(group) + ' ' + units[groupIndex] + ' ' + result;
    }
    groupIndex++;
  }
  
  return result.trim() + ' đồng';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};