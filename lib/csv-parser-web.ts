import { Asset } from '../types/asset';

interface CSVRow {
  [key: string]: string;
}

/**
 * Web-compatible CSV parser for depreciation data
 * Handles the format with columns:
 * - Account, Date, Payee (Name), Memo/Description, Account, Class/Department, Amount, 
 * - Date in place (Mid-month convention), Type, Cost, # of life (months), Method, 
 * - Monthly Dep, Inception to date (months), Accumulated Depreciation, NBV (YTD)
 * - Plus monthly depreciation schedule columns (MM/DD/YY format)
 */
export class WebCSVParser {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static parseDate(dateStr: string): string {
    if (!dateStr || dateStr.trim() === '') {
      return new Date().toISOString();
    }

    // Handle various date formats
    let cleanDate = dateStr.trim();
    
    // Handle MM/DD/YY format
    if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
      const [month, day, year] = cleanDate.split('/');
      const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
      const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    }
    
    // Handle MM/DD/YYYY format
    if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [month, day, year] = cleanDate.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    }
    
    // Handle M/D/YY format
    if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
      const [month, day, year] = cleanDate.split('/');
      let fullYear = parseInt(year);
      if (fullYear < 100) {
        fullYear = fullYear < 50 ? 2000 + fullYear : 1900 + fullYear;
      }
      const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
      return date.toISOString();
    }
    
    // Try to parse as a regular date
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    // Default to current date if parsing fails
    return new Date().toISOString();
  }

  private static parseNumber(value: string): number {
    if (!value || value.trim() === '' || value.trim() === '-') {
      return 0;
    }
    
    // Remove currency symbols, commas, spaces, and parentheses
    let cleaned = value.replace(/[$,\s()]/g, '');
    
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
    
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim());
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Skip empty rows (where key fields are empty)
      if (row['Memo/Description'] && row['Memo/Description'].trim() !== '') {
        rows.push(row);
      }
    }
    
    return { headers, rows };
  }

  private static buildDepreciationSchedule(row: CSVRow, headers: string[]): Record<string, number> {
    const depSchedule: Record<string, number> = {};
    
    // Look for date columns (MM/DD/YY or MM/DD/YYYY format)
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    
    headers.forEach(header => {
      if (datePattern.test(header) && header !== 'Date' && header !== 'Date in place (Mid-month convention)') {
        const value = this.parseNumber(row[header]);
        if (value !== 0) {
          // Convert MM/DD/YY to MM/DD/YYYY for consistency
          let normalizedDate = header;
          if (header.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
            const [month, day, year] = header.split('/');
            const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
            normalizedDate = `${month}/${day}/${fullYear}`;
          }
          depSchedule[normalizedDate] = value;
        }
      }
    });
    
    return depSchedule;
  }

  private static extractAssetName(description: string, payee: string): string {
    // Try to extract a meaningful asset name from the description and payee
    if (!description || description.trim() === '') {
      return payee || 'Unknown Asset';
    }
    
    // Clean up the description
    let assetName = description.trim();
    
    // Remove common prefixes and transaction details
    assetName = assetName.replace(/^ORIG CO NAME:.*?TRN:\s*\w+\s*/i, '');
    assetName = assetName.replace(/^Device purchase.*?order\s*/i, 'Device - ');
    assetName = assetName.replace(/^Laptop purchase.*?order\s*/i, 'Laptop - ');
    assetName = assetName.replace(/^New Laptop.*?order\s*/i, 'Laptop - ');
    assetName = assetName.replace(/^Rippling device.*?order\s*/i, 'Device - ');
    
    // Extract meaningful parts
    if (assetName.includes('MacBook')) {
      assetName = 'MacBook Pro';
    } else if (assetName.includes('Laptop') || assetName.includes('laptop')) {
      assetName = 'Laptop';
    } else if (assetName.includes('Device') || assetName.includes('device')) {
      assetName = 'Computer Device';
    }
    
    // Add payee context if available and meaningful
    if (payee && payee !== 'People Center' && payee !== '' && !assetName.includes(payee)) {
      assetName = `${assetName} (${payee})`;
    }
    
    return assetName || 'Computer Equipment';
  }

  public static parseCSVToAssets(csvContent: string): { assets: Asset[], errors: string[] } {
    const errors: string[] = [];
    const assets: Asset[] = [];
    
    try {
      const { headers, rows } = this.parseCSV(csvContent);
      
      if (rows.length === 0) {
        errors.push('No data rows found in CSV');
        return { assets, errors };
      }
      
      console.log(`Found ${rows.length} rows to process`);
      console.log('Headers:', headers);
      
      rows.forEach((row, index) => {
        try {
          // Skip rows without essential data
          if (!row['Cost'] || this.parseNumber(row['Cost']) === 0) {
            console.log(`Skipping row ${index + 2}: No cost data`);
            return;
          }
          
          const cost = this.parseNumber(row['Cost'] || '0');
          const lifeMonths = this.parseNumber(row['# of life (months)'] || '36');
          const monthlyDep = this.parseNumber(row['Monthly Dep'] || '0');
          const accumDep = this.parseNumber(row['Accumulated Depreciation'] || '0');
          const nbv = this.parseNumber(row['NBV (YTD)'] || '0');
          
          // Extract asset name from description and payee
          const assetName = this.extractAssetName(
            row['Memo/Description'] || '', 
            row['Payee (Name)'] || ''
          );
          
          const asset: Asset = {
            id: this.generateId(),
            asset: assetName,
            dateInPlace: this.parseDate(row['Date in place (Mid-month convention)'] || row['Date'] || ''),
            account: row['Account'] || 'Computer Equipment',
            department: row['Class/Department'] || 'General',
            cost: Math.abs(cost), // Ensure positive cost
            lifeMonths: lifeMonths || 36,
            monthlyDep: Math.abs(monthlyDep),
            accumDep: Math.abs(accumDep),
            nbv: nbv,
            depSchedule: this.buildDepreciationSchedule(row, headers)
          };
          
          // Basic validation
          if (asset.cost > 0 && asset.lifeMonths > 0) {
            assets.push(asset);
            console.log(`Processed asset ${index + 1}: ${asset.asset} ($${asset.cost})`);
          } else {
            errors.push(`Row ${index + 2}: Invalid cost (${asset.cost}) or life months (${asset.lifeMonths})`);
          }
        } catch (error) {
          const errorMsg = `Error processing row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      });
      
      console.log(`Successfully parsed ${assets.length} assets with ${errors.length} errors`);
      return { assets, errors };
    } catch (error) {
      const errorMsg = `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { assets, errors };
    }
  }

  public static validateAssets(assets: Asset[]): { valid: Asset[], invalid: Array<{ asset: Asset, errors: string[] }> } {
    const valid: Asset[] = [];
    const invalid: Array<{ asset: Asset, errors: string[] }> = [];
    
    assets.forEach((asset) => {
      const errors: string[] = [];
      
      if (!asset.asset || asset.asset.trim() === '') {
        errors.push('Asset name is required');
      }
      
      if (!asset.dateInPlace) {
        errors.push('Date in place is required');
      }
      
      if (asset.cost <= 0) {
        errors.push('Cost must be positive');
      }
      
      if (asset.lifeMonths <= 0) {
        errors.push('Life months must be positive');
      }
      
      if (errors.length === 0) {
        valid.push(asset);
      } else {
        invalid.push({ asset, errors });
      }
    });
    
    return { valid, invalid };
  }
}
