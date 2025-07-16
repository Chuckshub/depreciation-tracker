// Debug script to test the upload process with actual CSV data
const fs = require('fs');

// Simulate the WebCSVParser class
class TestWebCSVParser {
  static parseNumber(value) {
    if (!value || value === '') return 0;
    const cleanValue = value.toString().replace(/[,$"]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  }

  static parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') {
      return new Date().toISOString();
    }

    const cleanDate = dateStr.trim();
    
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
    
    // Try to parse as-is
    const date = new Date(cleanDate);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  static buildDepreciationSchedule(row, headers) {
    const depSchedule = {};
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    
    headers.forEach((header, index) => {
      if (datePattern.test(header) && header !== 'Date' && header !== 'Date in place (Mid-month convention)') {
        const value = this.parseNumber(row[index]);
        if (value !== 0) {
          // Convert M/D/YY to MM/DD/YYYY for consistency with app expectations
          let normalizedDate = header;
          if (header.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
            const [month, day, year] = header.split('/');
            let fullYear = parseInt(year);
            if (fullYear < 100) {
              fullYear = fullYear < 50 ? 2000 + fullYear : 1900 + fullYear;
            }
            // Pad month and day with leading zeros to match MM/DD/YYYY format
            const paddedMonth = month.padStart(2, '0');
            const paddedDay = day.padStart(2, '0');
            normalizedDate = `${paddedMonth}/${paddedDay}/${fullYear}`;
          }
          depSchedule[normalizedDate] = value;
        }
      }
    });
    
    return depSchedule;
  }

  static extractAssetName(description, payee) {
    if (!description || description.trim() === '') {
      return payee || 'Unknown Asset';
    }
    
    // Extract meaningful parts from description
    const desc = description.trim();
    
    // Look for common patterns
    if (desc.includes('MacBook') || desc.includes('Laptop')) {
      return `${payee} - Laptop`;
    }
    
    if (desc.includes('Device')) {
      return `${payee} - Device`;
    }
    
    // Use first few words of description
    const words = desc.split(' ').slice(0, 3).join(' ');
    return `${payee} - ${words}`;
  }

  static parseCSVToAssets(csvContent) {
    const assets = [];
    const errors = [];
    
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        errors.push('CSV must have at least a header row and one data row');
        return { assets, errors };
      }
      
      // Parse headers
      const headers = this.parseCSVLine(lines[0]);
      console.log(`Found ${headers.length} headers:`, headers.slice(0, 20)); // Show first 20 headers
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          
          if (values.length < headers.length - 5) { // Allow some flexibility
            console.log(`Row ${i + 1}: Skipping row with ${values.length} values (expected ~${headers.length})`);
            continue;
          }
          
          // Create row object
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Skip empty rows
          if (!row['Date'] && !row['Payee (Name)'] && !row['Cost']) {
            continue;
          }
          
          const cost = this.parseNumber(row['Cost'] || '0');
          const lifeMonths = this.parseNumber(row['# of life (months)'] || '36');
          const monthlyDep = this.parseNumber(row['Monthly Dep'] || '0');
          const accumDep = this.parseNumber(row['Accumulated Depreciation'] || '0');
          const nbv = this.parseNumber(row['NBV (YTD)'] || '0');
          
          // Extract asset name
          const assetName = this.extractAssetName(
            row['Memo/Description'] || '', 
            row['Payee (Name)'] || ''
          );
          
          const asset = {
            id: `asset_${i}`,
            asset: assetName,
            date: this.parseDate(row['Date'] || ''),
            dateInPlace: this.parseDate(row['Date in place (Mid-month convention)'] || row['Date'] || ''),
            account: row['Account'] || 'Computer Equipment',
            department: row['Class/Department'] || 'General',
            cost: Math.abs(cost),
            lifeMonths: lifeMonths || 36,
            monthlyDep: Math.abs(monthlyDep),
            accumDep: Math.abs(accumDep),
            nbv: nbv,
            depSchedule: this.buildDepreciationSchedule(values, headers)
          };
          
          // Basic validation
          if (asset.cost > 0 && asset.lifeMonths > 0) {
            assets.push(asset);
            console.log(`Processed asset ${assets.length}: ${asset.asset} ($${asset.cost})`);
          } else {
            errors.push(`Row ${i + 1}: Invalid cost (${asset.cost}) or life months (${asset.lifeMonths})`);
          }
        } catch (error) {
          const errorMsg = `Error processing row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
      
      console.log(`Successfully parsed ${assets.length} assets with ${errors.length} errors`);
      return { assets, errors };
    } catch (error) {
      const errorMsg = `Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { assets, errors };
    }
  }

  static parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  static validateAssets(assets) {
    const valid = [];
    const invalid = [];
    
    assets.forEach((asset) => {
      const errors = [];
      
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
        console.log(`Invalid asset: ${asset.asset}`, errors);
      }
    });
    
    return { valid, invalid };
  }
}

// Test with a sample of your CSV data
const sampleCSV = `Account,Date,Payee (Name),Memo/Description,Account,Class/Department,Amount,Date in place (Mid-month convention),Type, Cost ,# of life (months),Method, Monthly Dep , Inception to date (months) , Accumulated Depreciation , NBV (YTD) ,1/1/25,1/2/25,3/1/25,4/1/25,5/1/25,6/1/25,7/1/25,8/1/25,9/1/25,10/1/25,11/1/25,12/1/25,Asset Total
15003 - Computer Equipment,1/17/23,Amazon,Kyle Carberry,15003 - Computer Equipment,Research & Development : Research Engineering,"1,517.21",2/1/23,Computer/Laptop,"1,517.21",36,SL,42.14,29,1222,295.21,42.14,42.14,42.14,42.14,42.14,42.14,42.14,42.14,42.14,42.14,42.14,42.14,"1,517.21"
15003 - Computer Equipment,4/18/23,People Center,"ORIG CO NAME:PEOPLE CENTER ORIG ID:9135016000 DESC DATE:       CO ENTRY DESCR:BILL      SEC:CCD    TRACE#:021000020490054 EED:230418   IND ID:JBW928NYRPP8VYV              IND NAME:CODER TECHNOLOGIES, IN TRN: 1080490054TC",15003 - Computer Equipment,Research & Development : Enterprise Engineering,"2,147.95",5/1/23,Computer/Laptop,"2,147.95",36,SL,59.67,26,1551,596.95,59.67,59.67,59.67,59.67,59.67,59.67,59.67,59.67,59.67,59.67,59.67,59.67,"2,147.95"`;

console.log('Testing CSV parsing with sample data:');
console.log('=====================================');

const { assets, errors: parseErrors } = TestWebCSVParser.parseCSVToAssets(sampleCSV);

console.log(`\nParsing results:`);
console.log(`- Assets found: ${assets.length}`);
console.log(`- Parse errors: ${parseErrors.length}`);

if (parseErrors.length > 0) {
  console.log('\nParse errors:');
  parseErrors.forEach(error => console.log(`  - ${error}`));
}

if (assets.length > 0) {
  console.log('\nValidating assets...');
  const { valid, invalid } = TestWebCSVParser.validateAssets(assets);
  
  console.log(`\nValidation results:`);
  console.log(`- Valid assets: ${valid.length}`);
  console.log(`- Invalid assets: ${invalid.length}`);
  
  if (invalid.length > 0) {
    console.log('\nInvalid assets:');
    invalid.forEach(({ asset, errors }) => {
      console.log(`  - ${asset.asset}: ${errors.join(', ')}`);
    });
  }
  
  if (valid.length > 0) {
    console.log('\nFirst valid asset:');
    console.log(JSON.stringify(valid[0], null, 2));
  }
} else {
  console.log('\nNo assets were parsed successfully.');
}
