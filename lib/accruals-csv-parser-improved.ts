import { 
  Accrual, 
  AccrualEntry, 
  AccrualCSVImportResult, 
  AccrualCSVRow,
  AccrualValidationError,
  AccrualValidationResult,
  MonthColumn
} from '../types/accrual';

/**
 * Enhanced CSV parser for accruals data with comprehensive validation
 * and error handling
 */
export class EnhancedAccrualsCSVParser {
  private static readonly REQUIRED_COLUMNS = [
    'Vendor',
    'Description', 
    'Accrual JE Account (DR)',
    'Accrual JE Account (CR)'
  ];

  private static readonly DATE_PATTERNS = [
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YY or MM/DD/YYYY
    /^\d{1,2}\/\d{2}$/, // MM/YY
    /^\d{1,2}-\d{1,2}-\d{2,4}$/, // MM-DD-YY or MM-DD-YYYY
  ];

  private static readonly ACCOUNT_CODE_PATTERN = /^\d{4,6}$/;

  /**
   * Generate a unique ID for accruals
   */
  private static generateId(): string {
    return `accrual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse a number from various string formats
   */
  private static parseNumber(value: string): number {
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
   * Validate account code format
   */
  private static validateAccountCode(code: string): boolean {
    return this.ACCOUNT_CODE_PATTERN.test(code.trim());
  }

  /**
   * Check if a string matches date patterns
   */
  private static isDateColumn(header: string): boolean {
    return this.DATE_PATTERNS.some(pattern => pattern.test(header.trim()));
  }

  /**
   * Parse CSV line with proper quote handling
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Parse CSV content into structured data
   */
  private static parseCSV(csvContent: string): { headers: string[], rows: AccrualCSVRow[], errors: string[] } {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    
    if (lines.length === 0) {
      errors.push('CSV file is empty');
      return { headers: [], rows: [], errors };
    }
    
    // Skip metadata lines (account info, etc.)
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('vendor') || line.includes('description')) {
        headerIndex = i;
        break;
      }
    }
    
    if (headerIndex >= lines.length) {
      errors.push('Could not find header row with required columns');
      return { headers: [], rows: [], errors };
    }
    
    const headers = this.parseCSVLine(lines[headerIndex]).map(h => h.trim());
    
    // Validate required columns
    const missingColumns = this.REQUIRED_COLUMNS.filter(col => 
      !headers.some(h => h.toLowerCase().includes(col.toLowerCase()))
    );
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    const rows: AccrualCSVRow[] = [];
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length === 0 || values.every(v => !v.trim())) {
        continue; // Skip empty rows
      }
      
      const row: AccrualCSVRow = {
        vendor: '',
        description: '',
        accrualJEAccountDR: '',
        accrualJEAccountCR: '',
        balance: '0'
      };
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        const lowerHeader = header.toLowerCase();
        
        if (lowerHeader.includes('vendor')) {
          row.vendor = value;
        } else if (lowerHeader.includes('description')) {
          row.description = value;
        } else if (lowerHeader.includes('accrual je account (dr)') || lowerHeader.includes('account (dr)')) {
          row.accrualJEAccountDR = value;
        } else if (lowerHeader.includes('accrual je account (cr)') || lowerHeader.includes('account (cr)')) {
          row.accrualJEAccountCR = value;
        } else if (lowerHeader.includes('balance')) {
          row.balance = value;
        } else {
          // Store other columns (likely month data)
          row[header] = value;
        }
      });
      
      // Only add rows with vendor data
      if (row.vendor.trim()) {
        rows.push(row);
      }
    }
    
    return { headers, rows, errors };
  }

  /**
   * Build monthly entries from CSV row data
   */
  private static buildMonthlyEntries(row: AccrualCSVRow, headers: string[]): Record<string, AccrualEntry> {
    const monthlyEntries: Record<string, AccrualEntry> = {};
    const dateColumns: string[] = [];
    
    // Find all date columns
    headers.forEach(header => {
      if (this.isDateColumn(header)) {
        dateColumns.push(header);
      }
    });
    
    // Process date columns in pairs (reversal/accrual) or individually
    for (let i = 0; i < dateColumns.length; i++) {
      const currentColumn = dateColumns[i];
      const nextColumn = dateColumns[i + 1];
      
      const currentValue = this.parseNumber(row[currentColumn] || '0');
      
      if (nextColumn && this.isDateColumn(nextColumn)) {
        // Pair of columns - first is reversal, second is accrual
        const nextValue = this.parseNumber(row[nextColumn] || '0');
        
        if (currentValue !== 0 || nextValue !== 0) {
          monthlyEntries[currentColumn] = {
            reversal: currentValue,
            accrual: nextValue
          };
        }
        i++; // Skip next column since we processed it
      } else {
        // Single column - treat as accrual
        if (currentValue !== 0) {
          monthlyEntries[currentColumn] = {
            reversal: 0,
            accrual: currentValue
          };
        }
      }
    }
    
    return monthlyEntries;
  }

  /**
   * Validate an accrual object
   */
  private static validateAccrual(accrual: Accrual): AccrualValidationResult {
    const errors: AccrualValidationError[] = [];
    
    // Vendor validation
    if (!accrual.vendor || accrual.vendor.trim().length === 0) {
      errors.push({
        field: 'vendor',
        message: 'Vendor name is required',
        code: 'REQUIRED_FIELD'
      });
    } else if (accrual.vendor.length > 100) {
      errors.push({
        field: 'vendor',
        message: 'Vendor name must be less than 100 characters',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }
    
    // Account code validation
    if (accrual.accrualJEAccountDR && !this.validateAccountCode(accrual.accrualJEAccountDR)) {
      errors.push({
        field: 'accrualJEAccountDR',
        message: 'Invalid debit account code format (should be 4-6 digits)',
        code: 'INVALID_FORMAT'
      });
    }
    
    if (accrual.accrualJEAccountCR && !this.validateAccountCode(accrual.accrualJEAccountCR)) {
      errors.push({
        field: 'accrualJEAccountCR',
        message: 'Invalid credit account code format (should be 4-6 digits)',
        code: 'INVALID_FORMAT'
      });
    }
    
    // Balance validation
    if (typeof accrual.balance !== 'number' || isNaN(accrual.balance)) {
      errors.push({
        field: 'balance',
        message: 'Balance must be a valid number',
        code: 'INVALID_TYPE'
      });
    }
    
    // Monthly entries validation
    Object.entries(accrual.monthlyEntries).forEach(([monthKey, entry]) => {
      if (typeof entry.reversal !== 'number' || isNaN(entry.reversal)) {
        errors.push({
          field: `monthlyEntries.${monthKey}.reversal`,
          message: 'Reversal amount must be a valid number',
          code: 'INVALID_TYPE'
        });
      }
      
      if (typeof entry.accrual !== 'number' || isNaN(entry.accrual)) {
        errors.push({
          field: `monthlyEntries.${monthKey}.accrual`,
          message: 'Accrual amount must be a valid number',
          code: 'INVALID_TYPE'
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate balance from monthly entries
   */
  private static calculateBalance(monthlyEntries: Record<string, AccrualEntry>): number {
    return Object.values(monthlyEntries).reduce((sum, entry) => {
      return sum + entry.accrual + entry.reversal;
    }, 0);
  }

  /**
   * Main parsing function with comprehensive error handling
   */
  public static parseCSVToAccruals(csvContent: string): AccrualCSVImportResult {
    const result: AccrualCSVImportResult = {
      accruals: [],
      errors: [],
      warnings: [],
      summary: {
        totalRows: 0,
        successfulImports: 0,
        failedImports: 0,
        skippedRows: 0
      }
    };
    
    try {
      const { headers, rows, errors: parseErrors } = this.parseCSV(csvContent);
      
      result.errors.push(...parseErrors);
      result.summary.totalRows = rows.length;
      
      if (parseErrors.length > 0 && rows.length === 0) {
        return result;
      }
      
      rows.forEach((row, index) => {
        try {
          // Skip rows without essential data
          if (!row.vendor || row.vendor.trim() === '') {
            result.warnings.push(`Row ${index + 2}: Skipping row with no vendor data`);
            result.summary.skippedRows++;
            return;
          }
          
          const monthlyEntries = this.buildMonthlyEntries(row, headers);
          const calculatedBalance = this.calculateBalance(monthlyEntries);
          const providedBalance = this.parseNumber(row.balance);
          
          // Warn if calculated balance doesn't match provided balance
          if (Math.abs(calculatedBalance - providedBalance) > 0.01) {
            result.warnings.push(
              `Row ${index + 2}: Calculated balance (${calculatedBalance.toFixed(2)}) ` +
              `doesn't match provided balance (${providedBalance.toFixed(2)})`
            );
          }
          
          const accrual: Accrual = {
            id: this.generateId(),
            vendor: row.vendor.trim(),
            description: row.description?.trim() || '',
            accrualJEAccountDR: row.accrualJEAccountDR?.trim() || '',
            accrualJEAccountCR: row.accrualJEAccountCR?.trim() || '',
            balance: providedBalance || calculatedBalance,
            monthlyEntries,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
          };
          
          // Validate the accrual
          const validation = this.validateAccrual(accrual);
          
          if (validation.isValid) {
            result.accruals.push(accrual);
            result.summary.successfulImports++;
          } else {
            const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`);
            result.errors.push(`Row ${index + 2}: ${errorMessages.join(', ')}`);
            result.summary.failedImports++;
          }
        } catch (error) {
          const errorMsg = `Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          result.summary.failedImports++;
        }
      });
      
      return result;
    } catch (error) {
      result.errors.push(`Fatal parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Generate month columns for the current year
   */
  public static generateMonthColumns(year?: number): MonthColumn[] {
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
   * Export accruals to CSV format
   */
  public static exportToCSV(accruals: Accrual[], includeMonthlyDetails: boolean = true): string {
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
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
}