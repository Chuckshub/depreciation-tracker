import { Accrual, AccrualEntry } from '../types/accrual';

interface CSVRow {
  [key: string]: string;
}

/**
 * CSV parser for accruals data
 * Handles the format with columns:
 * - Vendor, Description, Accrual JE Account (DR), Accrual JE Account (CR)
 * - Monthly columns with Reversal/Accrual pairs
 * - Final Balance column
 */
export class AccrualsCSVParser {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static parseNumber(value: string): number {
    if (!value || value.trim() === '' || value.trim() === '-') {
      return 0;
    }
    
    // Remove currency symbols, commas, spaces, and quotes
    let cleaned = value.replace(/[$,\s"]/g, '');
    
    // Handle negative numbers in parentheses
    if (value.includes('(') && value.includes(')')) {
      cleaned = '-' + cleaned;
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static parseCSV(csvContent: string): { headers: string[], rows: CSVRow[] } {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Skip the first line if it contains account info (20005 - Accrued Expenses)
    let startIndex = 0;
    if (lines[0].includes('20005') || lines[0].includes('Accrued Expenses')) {
      startIndex = 1;
    }
    
    // Find the header row (contains "Vendor")
    let headerIndex = startIndex;
    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i].includes('Vendor')) {
        headerIndex = i;
        break;
      }
    }
    
    const headers = this.parseCSVLine(lines[headerIndex]).map(h => h.trim());
    const rows: CSVRow[] = [];
    
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Skip empty rows (where vendor is empty)
      if (row['Vendor'] && row['Vendor'].trim() !== '') {
        rows.push(row);
      }
    }
    
    return { headers, rows };
  }

  private static buildMonthlyEntries(row: CSVRow, headers: string[]): Record<string, AccrualEntry> {
    const monthlyEntries: Record<string, AccrualEntry> = {};
    
    // Look for date patterns in headers (MM/DD/YY format)
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (datePattern.test(header)) {
        // This is a date column, check if next column is also a date (reversal/accrual pair)
        const nextHeader = headers[i + 1];
        if (nextHeader && datePattern.test(nextHeader)) {
          // We have a pair - first is reversal, second is accrual
          const reversal = this.parseNumber(row[header] || '0');
          const accrual = this.parseNumber(row[nextHeader] || '0');
          
          if (reversal !== 0 || accrual !== 0) {
            monthlyEntries[header] = {
              reversal,
              accrual
            };
          }
          i++; // Skip the next header since we processed it
        } else {
          // Single entry for this date
          const value = this.parseNumber(row[header] || '0');
          if (value !== 0) {
            monthlyEntries[header] = {
              reversal: 0,
              accrual: value
            };
          }
        }
      }
    }
    
    return monthlyEntries;
  }

  public static parseCSVToAccruals(csvContent: string): { accruals: Accrual[], errors: string[] } {
    const errors: string[] = [];
    const accruals: Accrual[] = [];
    
    try {
      const { headers, rows } = this.parseCSV(csvContent);
      
      if (rows.length === 0) {
        errors.push('No data rows found in CSV');
        return { accruals, errors };
      }
      
      console.log(`Found ${rows.length} rows to process`);
      console.log('Headers:', headers);
      
      rows.forEach((row, index) => {
        try {
          // Skip rows without essential data
          if (!row['Vendor'] || row['Vendor'].trim() === '') {
            console.log(`Skipping row ${index + 2}: No vendor data`);
            return;
          }
          
          const balance = this.parseNumber(row['Balance'] || '0');
          
          const accrual: Accrual = {
            id: this.generateId(),
            vendor: row['Vendor'].trim(),
            description: row['Description']?.trim() || '',
            accrualJEAccountDR: row['Accrual JE Account (DR)']?.trim() || '',
            accrualJEAccountCR: row['Accrual JE Account (CR)']?.trim() || '',
            balance,
            monthlyEntries: this.buildMonthlyEntries(row, headers)
          };
          
          accruals.push(accrual);
          console.log(`Processed accrual ${index + 1}: ${accrual.vendor} ($${accrual.balance})`);
        } catch (error) {
          const errorMsg = `Error processing row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      });
      
      console.log(`Successfully parsed ${accruals.length} accruals with ${errors.length} errors`);
      return { accruals, errors };
    } catch (error) {
      const errorMsg = `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { accruals, errors };
    }
  }

  public static validateAccruals(accruals: Accrual[]): { valid: Accrual[], invalid: Array<{ accrual: Accrual, errors: string[] }> } {
    const valid: Accrual[] = [];
    const invalid: Array<{ accrual: Accrual, errors: string[] }> = [];
    
    accruals.forEach((accrual) => {
      const errors: string[] = [];
      
      if (!accrual.vendor || accrual.vendor.trim() === '') {
        errors.push('Vendor name is required');
      }
      
      if (!accrual.accrualJEAccountDR || accrual.accrualJEAccountDR.trim() === '') {
        errors.push('Accrual JE Account (DR) is required');
      }
      
      if (!accrual.accrualJEAccountCR || accrual.accrualJEAccountCR.trim() === '') {
        errors.push('Accrual JE Account (CR) is required');
      }
      
      if (errors.length === 0) {
        valid.push(accrual);
      } else {
        invalid.push({ accrual, errors });
      }
    });
    
    return { valid, invalid };
  }
}
