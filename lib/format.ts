// Format number with dynamic font size based on length
export function getDynamicFontSize(value: number | string): string {
  const digitCount = Math.abs(typeof value === 'number' ? value : parseFloat(value) || 0).toString().length;
  
  if (digitCount >= 15) return 'text-[10px]';
  if (digitCount >= 10) return 'text-xs';
  return 'text-sm';
}

// Format number with locale
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('uz-UZ').format(value);
}
