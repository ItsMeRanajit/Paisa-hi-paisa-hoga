/**
 * Currency formatter with Indian numbering system (Lakhs/Crores) or standard representation
 */
export const formatCurrency = (
  amount: number | undefined | null,
  currency: string = '₹',
  includeDecimals: boolean = false
): string => {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formatted = absNum.toLocaleString('en-IN', {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  });

  return `${isNegative ? '-' : ''}${currency}${formatted}`;
};

/**
 * Format percentage with customizable precision
 */
export const formatPercentage = (value: number | undefined | null, decimals: number = 1): string => {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}%`;
};

/**
 * Formats a 'YYYY-MM' string into a friendly label like "August 2026"
 */
export const formatMonthDisplay = (monthStr: string): string => {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthNumStr, 10) - 1;

  const date = new Date(year, monthNum, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Combines entered day number with the active month string (e.g. 14 + '2026-08' -> "14 August 2026")
 */
export const formatDayWithMonth = (day: number, monthStr: string): string => {
  if (!monthStr || !monthStr.includes('-')) return `${day} ${monthStr}`;
  const [yearStr, monthNumStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthNumStr, 10) - 1;

  const date = new Date(year, monthNum, Math.min(31, Math.max(1, day)));
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return `${day} ${monthName} ${year}`;
};

/**
 * Helper to step backward or forward in months
 */
export const getOffsetMonth = (monthStr: string, offset: number): string => {
  const [yearStr, monthNumStr] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthNumStr, 10) + offset;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  const paddedMonth = month.toString().padStart(2, '0');
  return `${year}-${paddedMonth}`;
};

/**
 * Get current system month in YYYY-MM format
 */
export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};
