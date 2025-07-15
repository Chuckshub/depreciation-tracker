/**
 * Format a number as US currency with two decimal places
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format an ISO date string to a human-readable date
 */
export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Generate array of month keys for 2025 (01/01/2025 through 12/01/2025)
 */
export const get2025MonthKeys = (): string[] => {
  const months = [];
  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');
    months.push(`${monthStr}/01/2025`);
  }
  return months;
};

/**
 * Get month name from month key (e.g., "01/01/2025" -> "Jan 2025")
 */
export const getMonthName = (monthKey: string): string => {
  try {
    const [month, , year] = monthKey.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return monthKey;
  }
};
