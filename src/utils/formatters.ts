// Mask and format helper utilities for order entry forms

// Currency formatter: converts raw typed numbers to "R$ 1.250,00"
export function formatCurrencyInput(val: string | number): { display: string; numericValue: number } {
  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return { display: 'R$ 0,00', numericValue: 0 };
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
    return { display: formatted, numericValue: val };
  }

  // Strip anything that is not a digit
  const digitsOnly = val.replace(/\D/g, '');
  if (!digitsOnly) {
    return { display: '', numericValue: 0 };
  }

  const numberValue = parseInt(digitsOnly, 10) / 100;
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);

  return { display: formatted, numericValue: numberValue };
}

// Date formatter: transforms "14112026" to "14/11/2026"
export function formatDateInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

// Converts "DD/MM/AAAA" or "YYYY-MM-DD" to standard ISO "YYYY-MM-DD"
export function toIsoDate(val: string): string {
  if (!val) return '';
  if (val.includes('-') && val.split('-')[0].length === 4) {
    return val; // already YYYY-MM-DD
  }
  const parts = val.split('/');
  if (parts.length === 3 && parts[2]?.length === 4) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return val;
}

// Converts "YYYY-MM-DD" to "DD/MM/AAAA"
export function toBrazilianDate(val: string): string {
  if (!val) return '';
  if (val.includes('/')) return val;
  const parts = val.split('-');
  if (parts.length === 3 && parts[0]?.length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return val;
}

// Time formatter: transforms "1400" to "14:00"
export function formatTimeInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    const hours = parseInt(digits, 10);
    if (hours > 23) return '23';
    return digits;
  }

  let hoursStr = digits.slice(0, 2);
  let minsStr = digits.slice(2, 4);

  let hours = parseInt(hoursStr, 10);
  if (hours > 23) hoursStr = '23';

  let mins = parseInt(minsStr, 10);
  if (mins > 59) minsStr = '59';

  return `${hoursStr}:${minsStr}`;
}

// Phone formatter: transforms "11987654321" to "(11) 98765-4321"
export function formatPhoneInput(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
