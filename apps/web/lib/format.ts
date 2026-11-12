/**
 * Format integer rupee amounts with Indian numeral grouping (en-IN).
 * e.g., 150000 -> "₹1,50,000"
 */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format raw numbers with Indian grouping.
 * e.g., 5000 -> "5,000"
 */
export function formatNumberIN(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
