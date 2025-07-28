import { Accrual, AccrualEntry, AccrualSummary, MonthColumn } from '@/types/accrual';

/**
 * Utility functions for accrual operations
 */
export class AccrualUtils {
  /**
   * Calculate balance from monthly entries
   */
  static calculateBalance(monthlyEntries: Record<string, AccrualEntry>): number {
    return Object.values(monthlyEntries).reduce((sum, entry) => {
      return sum + entry.accrual + entry.reversal;
    }, 0);
  }

  /**
   * Generate month columns for a given year
   */
  static generateMonthColumns(year?: number): MonthColumn[] {
    const targetYear = year || new Date().getFullYear();
    const months: MonthColumn[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const date = new Date(targetYear, month - 1, 1);
      const monthKey = `${month}/${targetYear.toString().slice(-2)}`;
      const displayMonth = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        key: monthKey,
        display: monthKey,
        shortDisplay: displayMonth,
        monthName: date.toLocaleDateString('en-US', { month: 'long' }),
        year: targetYear,
        month
      });
    }
    
    return months;
  }

  /**
   * Calculate summary statistics for accruals
   */
  static calculateSummary(accruals: Accrual[], balanceSheetAmount: number = 0): AccrualSummary {
    const totalBalance = accruals.reduce((sum, accrual) => sum + accrual.balance, 0);
    
    const totalReversal = accruals.reduce((sum, accrual) => {
      return sum + Object.values(accrual.monthlyEntries).reduce((entrySum, entry) => 
        entrySum + entry.reversal, 0
      );
    }, 0);
    
    const totalAccrual = accruals.reduce((sum, accrual) => {
      return sum + Object.values(accrual.monthlyEntries).reduce((entrySum, entry) => 
        entrySum + entry.accrual, 0
      );
    }, 0);
    
    const monthlyActivity = accruals.reduce((sum, accrual) => {
      return sum + Object.values(accrual.monthlyEntries).reduce((entrySum, entry) => 
        entrySum + Math.abs(entry.accrual) + Math.abs(entry.reversal), 0
      );
    }, 0);
    
    return {
      totalBalance,
      activeAccruals: accruals.filter(a => a.isActive !== false).length,
      monthlyActivity,
      vendorCount: new Set(accruals.map(a => a.vendor)).size,
      totalReversal,
      totalAccrual,
      variance: totalBalance - balanceSheetAmount,
      balanceSheetAmount
    };
  }

  /**
   * Format currency values
   */
  static formatCurrency(amount: number, showZero: boolean = false): string {
    if (amount === 0 && !showZero) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Parse number from string with various formats
   */
  static parseNumber(value: string): number {
    if (!value || value.trim() === '' || value.trim() === '-') {
      return 0;
    }
    
    // Remove currency symbols, commas, spaces, and quotes
    let cleaned = value.replace(/[$,\s"]/g, '');
    
    // Handle negative numbers in parentheses
    if (value.includes('(') && value.includes(')')) {
      cleaned = '-' + cleaned.replace(/[()]/g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Generate unique ID for accruals
   */
  static generateId(): string {
    return `accrual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new empty accrual
   */
  static createEmptyAccrual(): Accrual {
    return {
      id: this.generateId(),
      vendor: '',
      description: '',
      accrualJEAccountDR: '',
      accrualJEAccountCR: '20005',
      balance: 0,
      monthlyEntries: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  }

  /**
   * Deep clone an accrual object
   */
  static cloneAccrual(accrual: Accrual): Accrual {
    return {
      ...accrual,
      monthlyEntries: { ...accrual.monthlyEntries },
      createdAt: accrual.createdAt ? new Date(accrual.createdAt) : undefined,
      updatedAt: accrual.updatedAt ? new Date(accrual.updatedAt) : undefined
    };
  }

  /**
   * Check if accrual has any monthly activity
   */
  static hasActivity(accrual: Accrual): boolean {
    return Object.values(accrual.monthlyEntries).some(entry => 
      entry.accrual !== 0 || entry.reversal !== 0
    );
  }

  /**
   * Get monthly totals for a specific month across all accruals
   */
  static getMonthlyTotals(accruals: Accrual[], monthKey: string): { reversal: number; accrual: number } {
    return accruals.reduce(
      (totals, accrual) => {
        const entry = accrual.monthlyEntries[monthKey];
        if (entry) {
          totals.reversal += entry.reversal;
          totals.accrual += entry.accrual;
        }
        return totals;
      },
      { reversal: 0, accrual: 0 }
    );
  }

  /**
   * Sort accruals by a given field
   */
  static sortAccruals(accruals: Accrual[], field: keyof Accrual, direction: 'asc' | 'desc'): Accrual[] {
    return [...accruals].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === 'asc' ? -1 : 1;
      if (bValue === undefined) return direction === 'asc' ? 1 : -1;

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter accruals based on search term
   */
  static searchAccruals(accruals: Accrual[], searchTerm: string): Accrual[] {
    if (!searchTerm.trim()) return accruals;
    
    const term = searchTerm.toLowerCase();
    return accruals.filter(accrual => 
      accrual.vendor.toLowerCase().includes(term) ||
      accrual.description.toLowerCase().includes(term) ||
      accrual.accrualJEAccountDR.includes(term) ||
      accrual.accrualJEAccountCR.includes(term) ||
      (accrual.notes && accrual.notes.toLowerCase().includes(term))
    );
  }

  /**
   * Export accruals to CSV format
   */
  static exportToCSV(accruals: Accrual[], includeMonthlyDetails: boolean = true): string {
    const monthColumns = this.generateMonthColumns();
    
    const headers = [
      'Vendor',
      'Description', 
      'Accrual JE Account (DR)',
      'Accrual JE Account (CR)'
    ];
    
    if (includeMonthlyDetails) {
      monthColumns.forEach(month => {
        headers.push(`${month.display} Reversal`, `${month.display} Accrual`);
      });
    }
    
    headers.push('Balance', 'Created At', 'Updated At', 'Notes');
    
    const rows = accruals.map(accrual => {
      const row = [
        accrual.vendor,
        accrual.description,
        accrual.accrualJEAccountDR,
        accrual.accrualJEAccountCR
      ];
      
      if (includeMonthlyDetails) {
        monthColumns.forEach(month => {
          const entry = accrual.monthlyEntries[month.key] || { reversal: 0, accrual: 0 };
          row.push(entry.reversal.toString(), entry.accrual.toString());
        });
      }
      
      row.push(
        accrual.balance.toString(),
        accrual.createdAt?.toISOString() || '',
        accrual.updatedAt?.toISOString() || '',
        accrual.notes || ''
      );
      
      return row;
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  }

  /**
   * Validate balance consistency
   */
  static validateBalance(accrual: Accrual): { isValid: boolean; calculatedBalance: number; difference: number } {
    const calculatedBalance = this.calculateBalance(accrual.monthlyEntries);
    const difference = Math.abs(accrual.balance - calculatedBalance);
    
    return {
      isValid: difference < 0.01, // Allow for small rounding differences
      calculatedBalance,
      difference
    };
  }
}