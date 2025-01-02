export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  // Remove currency symbol, commas, and other non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) return 0;
  
  // Parse the clean value
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
}

export function formatInputCurrency(value: string): string {
  const number = parseCurrencyInput(value);
  if (number === 0) return '';
  return number.toFixed(2);
}
