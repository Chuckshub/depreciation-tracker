import { Asset } from '../types/asset';
import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  [key: string]: string;
}

/**
 * Parses a CSV file and converts it to Asset objects
 * Expected CSV columns:
 * - Asset (string): Asset name/description
 * - Date In Place (string): Date when asset was placed in service (MM/DD/YYYY)
 * - Account (string): Account code/name
 * - Department (string): Department name
 * - Cost (number): Original cost of the asset
 * - Life Months (number): Useful life in months
 * - Monthly Dep (number): Monthly depreciation amount
 * - Accum Dep (number): Accumulated depreciation
 * - NBV (number): Net Book Value
 * - Additional columns for depreciation schedule (MM/DD/YYYY format)
 */
export class CSVParser {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static parseDate(dateStr: string): string {
    // Convert MM/DD/YYYY to ISO string
    const [month, day, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toISOString();
  }

  private static parseNumber(value: string): number {
    // Remove any currency symbols, commas, and parse as float
    const cleaned = value.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
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

  private static parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = this.parseCSVLine(lines[0]).map(h => h.trim());
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    return rows;
  }

  private static buildDepreciationSchedule(row: CSVRow, headers: string[]): Record<string, number> {
    const depSchedule: Record<string, number> = {};
    
    // Look for date columns (MM/DD/YYYY format) that aren't the main "Date In Place" column
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    
    headers.forEach(header => {
      if (datePattern.test(header) && header !== 'Date In Place') {
        const value = this.parseNumber(row[header]);
        if (value !== 0) {
          depSchedule[header] = value;
        }
      }
    });
    
    return depSchedule;
  }

  public static parseCSVToAssets(csvFilePath: string): Asset[] {
    try {
      const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
      const rows = this.parseCSV(csvContent);
      const assets: Asset[] = [];
      
      if (rows.length === 0) {
        console.log('No data rows found in CSV');
        return [];
      }
      
      // Get headers for depreciation schedule parsing
      const firstLine = csvContent.split('\n')[0];
      const headers = this.parseCSVLine(firstLine).map(h => h.trim());
      
      console.log(`Found ${rows.length} rows to process`);
      console.log('Headers:', headers);
      
      rows.forEach((row, index) => {
        try {
          // Skip empty rows
          if (!row['Asset'] || row['Asset'].trim() === '') {
            console.log(`Skipping empty row ${index + 2}`);
            return;
          }
          
          const asset: Asset = {
            id: this.generateId(),
            asset: row['Asset'] || '',
            dateInPlace: row['Date In Place'] ? this.parseDate(row['Date In Place']) : new Date().toISOString(),
            account: row['Account'] || '',
            department: row['Department'] || '',
            cost: this.parseNumber(row['Cost'] || '0'),
            lifeMonths: this.parseNumber(row['Life Months'] || '0'),
            monthlyDep: this.parseNumber(row['Monthly Dep'] || '0'),
            accumDep: this.parseNumber(row['Accum Dep'] || '0'),
            nbv: this.parseNumber(row['NBV'] || '0'),
            assetType: 'computer-equipment', // Default to computer equipment for script imports
            depSchedule: this.buildDepreciationSchedule(row, headers)
          };
          
          assets.push(asset);
          console.log(`Processed asset ${index + 1}: ${asset.asset}`);
        } catch (error) {
          console.error(`Error processing row ${index + 2}:`, error);
          console.error('Row data:', row);
        }
      });
      
      console.log(`Successfully parsed ${assets.length} assets`);
      return assets;
    } catch (error) {
      console.error('Error reading or parsing CSV file:', error);
      throw error;
    }
  }

  public static saveAssetsToJSON(assets: Asset[], outputPath: string): void {
    try {
      const data = {
        assets,
        metadata: {
          totalAssets: assets.length,
          importDate: new Date().toISOString(),
          source: 'CSV Import'
        }
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`Saved ${assets.length} assets to ${outputPath}`);
    } catch (error) {
      console.error('Error saving assets to JSON:', error);
      throw error;
    }
  }

  public static validateAssets(assets: Asset[]): { valid: Asset[], invalid: any[] } {
    const valid: Asset[] = [];
    const invalid: any[] = [];
    
    assets.forEach((asset, index) => {
      const errors: string[] = [];
      
      if (!asset.asset || asset.asset.trim() === '') {
        errors.push('Asset name is required');
      }
      
      if (!asset.dateInPlace) {
        errors.push('Date in place is required');
      }
      
      if (asset.cost < 0) {
        errors.push('Cost cannot be negative');
      }
      
      if (asset.lifeMonths <= 0) {
        errors.push('Life months must be positive');
      }
      
      if (errors.length === 0) {
        valid.push(asset);
      } else {
        invalid.push({ index, asset, errors });
      }
    });
    
    return { valid, invalid };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: ts-node csv-parser.ts <csv-file-path> [output-json-path]');
    process.exit(1);
  }
  
  const csvPath = args[0];
  const outputPath = args[1] || 'parsed-assets.json';
  
  try {
    console.log(`Parsing CSV file: ${csvPath}`);
    const assets = CSVParser.parseCSVToAssets(csvPath);
    
    console.log('\nValidating assets...');
    const { valid, invalid } = CSVParser.validateAssets(assets);
    
    if (invalid.length > 0) {
      console.log(`\nFound ${invalid.length} invalid assets:`);
      invalid.forEach(item => {
        console.log(`Row ${item.index + 2}: ${item.errors.join(', ')}`);
      });
    }
    
    console.log(`\nValid assets: ${valid.length}`);
    
    if (valid.length > 0) {
      CSVParser.saveAssetsToJSON(valid, outputPath);
      console.log(`\nParsing complete! ${valid.length} assets saved to ${outputPath}`);
    } else {
      console.log('No valid assets to save.');
    }
  } catch (error) {
    console.error('Failed to parse CSV:', error);
    process.exit(1);
  }
}
