// Ultimate Prepaid Tracker Utilities

export class UltimatePrepaidUtils {
  /**
   * Format currency with proper styling
   */
  static formatCurrency(amount: number, showZero = false): string {
    if (amount === 0 && !showZero) return ''
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Parse number from various string formats
   */
  static parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0
    const cleaned = value.replace(/[$,\s]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Calculate variance between prepaid balance and balance sheet
   */
  static calculateVariance(
    prepaidBalance: number, 
    balanceSheetAmount: number
  ): {
    variance: number
    isBalanced: boolean
    percentage: number
  } {
    const variance = prepaidBalance - balanceSheetAmount
    const isBalanced = Math.abs(variance) < 0.01
    const percentage = balanceSheetAmount !== 0 ? (variance / balanceSheetAmount) * 100 : 0
    
    return {
      variance,
      isBalanced,
      percentage
    }
  }
}