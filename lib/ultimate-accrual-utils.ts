import {
  AccrualVendor,
  AccrualRecord,
  MonthColumn,
  AccrualSummary,
  MonthlyEntry,
  ImportResult,
  ExportOptions
} from '@/types/ultimate-accrual'

/**
 * Ultimate Accrual Tracker Utilities
 * Comprehensive utility functions for the best accrual tracking experience
 */
export class UltimateAccrualUtils {
  /**
   * Generate month columns for a given year
   */
  static generateMonthColumns(year?: number): MonthColumn[] {
    const targetYear = year || new Date().getFullYear()
    const months: MonthColumn[] = []
    
    for (let month = 1; month <= 12; month++) {
      const key = `${month}/${targetYear.toString().slice(-2)}`
      const date = new Date(targetYear, month - 1, 1)
      
      months.push({
        key,
        month,
        year: targetYear,
        displayName: key,
        fullName: date.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })
      })
    }
    
    return months
  }

  /**
   * Calculate comprehensive summary statistics
   */
  static calculateSummary(
    records: AccrualRecord[], 
    months: MonthColumn[],
    includeInactive = false
  ): AccrualSummary {
    const monthlyTotals: Record<string, { reversals: number; accruals: number }> = {}
    let totalReversals = 0
    let totalAccruals = 0
    let activeVendorCount = 0
    
    // Initialize monthly totals
    months.forEach(month => {
      monthlyTotals[month.key] = { reversals: 0, accruals: 0 }
    })
    
    // Calculate totals from active records
    const filteredRecords = includeInactive ? records : records.filter(r => r.isActive)
    
    filteredRecords.forEach(record => {
      if (record.isActive) activeVendorCount++
      
      Object.entries(record.monthlyEntries).forEach(([monthKey, entry]) => {
        if (monthlyTotals[monthKey]) {
          monthlyTotals[monthKey].reversals += entry.reversal
          monthlyTotals[monthKey].accruals += entry.accrual
        }
        totalReversals += entry.reversal
        totalAccruals += entry.accrual
      })
    })
    
    const netBalance = totalAccruals + totalReversals // reversals are negative
    
    return {
      totalReversals,
      totalAccruals,
      netBalance,
      monthlyTotals,
      vendorCount: records.length,
      activeVendorCount
    }
  }

  /**
   * Calculate balance for a specific record
   */
  static calculateRecordBalance(monthlyEntries: Record<string, MonthlyEntry>): number {
    return Object.values(monthlyEntries).reduce((sum, entry) => 
      sum + entry.accrual + entry.reversal, 0
    )
  }

  /**
   * Format currency with proper styling
   */
  static formatCurrency(amount: number, options: {
    showZero?: boolean
    showSign?: boolean
    precision?: number
  } = {}): string {
    const { showZero = false, showSign = false, precision = 2 } = options
    
    if (amount === 0 && !showZero) return ''
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(Math.abs(amount))
    
    if (showSign && amount !== 0) {
      return amount < 0 ? `-${formatted}` : `+${formatted}`
    }
    
    return formatted
  }

  /**
   * Parse number from various string formats
   */
  static parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0
    
    // Remove currency symbols, commas, spaces
    let cleaned = value.replace(/[$,\s]/g, '')
    
    // Handle negative numbers in parentheses
    if (value.includes('(') && value.includes(')')) {
      cleaned = '-' + cleaned.replace(/[()]/g, '')
    }
    
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
   * Create a new vendor
   */
  static createVendor(name: string, description?: string): AccrualVendor {
    return {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Create a new accrual record
   */
  static createRecord(vendor: AccrualVendor): AccrualRecord {
    return {
      id: this.generateId(),
      vendorId: vendor.id,
      vendor,
      monthlyEntries: {},
      balance: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Update a monthly entry and recalculate balance
   */
  static updateMonthlyEntry(
    record: AccrualRecord,
    monthKey: string,
    field: 'reversal' | 'accrual',
    value: number
  ): AccrualRecord {
    const updatedEntries = { ...record.monthlyEntries }
    const currentEntry = updatedEntries[monthKey] || { reversal: 0, accrual: 0 }
    
    updatedEntries[monthKey] = {
      ...currentEntry,
      [field]: value
    }
    
    const newBalance = this.calculateRecordBalance(updatedEntries)
    
    return {
      ...record,
      monthlyEntries: updatedEntries,
      balance: newBalance,
      updatedAt: new Date()
    }
  }

  /**
   * Export records to CSV format
   */
  static exportToCSV(
    records: AccrualRecord[],
    months: MonthColumn[],
    options: ExportOptions = { includeInactive: false, format: 'csv' }
  ): string {
    const filteredRecords = options.includeInactive 
      ? records 
      : records.filter(r => r.isActive)
    
    // Create headers
    const headers = [
      'Vendor',
      'Description',
      ...months.flatMap(month => [`${month.displayName} Reversal`, `${month.displayName} Accrual`]),
      'Balance',
      'Created',
      'Updated'
    ]
    
    // Create data rows
    const rows = filteredRecords.map(record => {
      const row = [
        record.vendor.name,
        record.vendor.description || ''
      ]
      
      // Add monthly data
      months.forEach(month => {
        const entry = record.monthlyEntries[month.key] || { reversal: 0, accrual: 0 }
        row.push(
          entry.reversal.toString(),
          entry.accrual.toString()
        )
      })
      
      // Add balance and timestamps
      row.push(
        record.balance.toString(),
        record.createdAt.toISOString(),
        record.updatedAt.toISOString()
      )
      
      return row
    })
    
    // Add totals row
    const summary = this.calculateSummary(filteredRecords, months, options.includeInactive)
    const totalsRow = ['TOTALS', '']
    
    months.forEach(month => {
      const monthTotal = summary.monthlyTotals[month.key] || { reversals: 0, accruals: 0 }
      totalsRow.push(
        monthTotal.reversals.toString(),
        monthTotal.accruals.toString()
      )
    })
    
    totalsRow.push(summary.netBalance.toString(), '', '')
    
    // Combine all data
    const allRows = [headers, ...rows, totalsRow]
    
    // Convert to CSV
    return allRows
      .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')
  }

  /**
   * Import records from CSV content
   */
  static async importFromCSV(
    csvContent: string,
    existingVendors: AccrualVendor[]
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsImported: 0,
      vendorsCreated: 0,
      errors: [],
      warnings: []
    }
    
    try {
      const lines = csvContent.split('\n').filter(line => line.trim())
      if (lines.length === 0) {
        result.errors.push('CSV file is empty')
        return result
      }
      
      // Parse header
      const headers = this.parseCSVLine(lines[0])
      const vendorIndex = headers.findIndex(h => h.toLowerCase().includes('vendor'))
      const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('description'))
      
      if (vendorIndex === -1) {
        result.errors.push('Vendor column not found in CSV')
        return result
      }
      
      // Find month columns
      const monthColumns: { index: number; key: string; type: 'reversal' | 'accrual' }[] = []
      headers.forEach((header, index) => {
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes('reversal')) {
          const monthMatch = header.match(/\d+\/\d+/)
          if (monthMatch) {
            monthColumns.push({ index, key: monthMatch[0], type: 'reversal' })
          }
        } else if (lowerHeader.includes('accrual')) {
          const monthMatch = header.match(/\d+\/\d+/)
          if (monthMatch) {
            monthColumns.push({ index, key: monthMatch[0], type: 'accrual' })
          }
        }
      })
      
      // Process data rows
      const newVendors: AccrualVendor[] = [...existingVendors]
      const newRecords: AccrualRecord[] = []
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])
          const vendorName = values[vendorIndex]?.trim()
          
          if (!vendorName || vendorName.toLowerCase() === 'totals') continue
          
          // Find or create vendor
          let vendor = newVendors.find(v => v.name.toLowerCase() === vendorName.toLowerCase())
          if (!vendor) {
            vendor = this.createVendor(
              vendorName,
              descriptionIndex >= 0 ? values[descriptionIndex] : undefined
            )
            newVendors.push(vendor)
            result.vendorsCreated++
          }
          
          // Create record with monthly entries
          const monthlyEntries: Record<string, MonthlyEntry> = {}
          monthColumns.forEach(({ index, key, type }) => {
            const value = this.parseNumber(values[index] || '0')
            if (!monthlyEntries[key]) {
              monthlyEntries[key] = { reversal: 0, accrual: 0 }
            }
            monthlyEntries[key][type] = value
          })
          
          const record = this.createRecord(vendor)
          record.monthlyEntries = monthlyEntries
          record.balance = this.calculateRecordBalance(monthlyEntries)
          
          newRecords.push(record)
          result.recordsImported++
          
        } catch (error) {
          result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      result.success = result.recordsImported > 0
      return result
      
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  /**
   * Parse CSV line with proper quote handling
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i += 2
        } else {
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    result.push(current.trim())
    return result
  }

  /**
   * Validate vendor name
   */
  static validateVendorName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Vendor name is required' }
    }
    
    if (name.length > 100) {
      return { isValid: false, error: 'Vendor name must be less than 100 characters' }
    }
    
    return { isValid: true }
  }

  /**
   * Validate monetary amount
   */
  static validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (isNaN(amount)) {
      return { isValid: false, error: 'Amount must be a valid number' }
    }
    
    if (Math.abs(amount) > 999999999) {
      return { isValid: false, error: 'Amount is too large' }
    }
    
    return { isValid: true }
  }

  /**
   * Search and filter records
   */
  static filterRecords(
    records: AccrualRecord[],
    searchTerm: string,
    options: {
      includeInactive?: boolean
      hasActivity?: boolean | null
      minBalance?: number
      maxBalance?: number
    } = {}
  ): AccrualRecord[] {
    return records.filter(record => {
      // Active filter
      if (!options.includeInactive && !record.isActive) return false
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesVendor = record.vendor.name.toLowerCase().includes(searchLower)
        const matchesDescription = record.vendor.description?.toLowerCase().includes(searchLower)
        if (!matchesVendor && !matchesDescription) return false
      }
      
      // Activity filter
      if (options.hasActivity !== null && options.hasActivity !== undefined) {
        const hasActivity = Object.values(record.monthlyEntries).some(entry => 
          entry.accrual !== 0 || entry.reversal !== 0
        )
        if (hasActivity !== options.hasActivity) return false
      }
      
      // Balance filters
      if (options.minBalance !== undefined && record.balance < options.minBalance) return false
      if (options.maxBalance !== undefined && record.balance > options.maxBalance) return false
      
      return true
    })
  }

  /**
   * Sort records by various criteria
   */
  static sortRecords(
    records: AccrualRecord[],
    field: 'vendor' | 'balance' | 'activity' | 'created',
    direction: 'asc' | 'desc' = 'asc'
  ): AccrualRecord[] {
    return [...records].sort((a, b) => {
      let comparison = 0
      
      switch (field) {
        case 'vendor':
          comparison = a.vendor.name.localeCompare(b.vendor.name)
          break
        case 'balance':
          comparison = a.balance - b.balance
          break
        case 'activity':
          const aActivity = Object.values(a.monthlyEntries).reduce((sum, entry) => 
            sum + Math.abs(entry.accrual) + Math.abs(entry.reversal), 0
          )
          const bActivity = Object.values(b.monthlyEntries).reduce((sum, entry) => 
            sum + Math.abs(entry.accrual) + Math.abs(entry.reversal), 0
          )
          comparison = aActivity - bActivity
          break
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }
      
      return direction === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Get month name from key
   */
  static getMonthName(monthKey: string): string {
    const [month, year] = monthKey.split('/')
    const date = new Date(2000 + parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  /**
   * Calculate variance between accrual balance and balance sheet
   */
  static calculateVariance(accrualBalance: number, balanceSheetAmount: number): {
    variance: number
    isBalanced: boolean
    percentage: number
  } {
    const variance = accrualBalance - balanceSheetAmount
    const isBalanced = Math.abs(variance) < 0.01
    const percentage = balanceSheetAmount !== 0 ? (variance / balanceSheetAmount) * 100 : 0
    
    return {
      variance,
      isBalanced,
      percentage
    }
  }
}