// Test the new CSV parser format
const fs = require('fs');

// Simple CSV parser test for new format
function parseCSVLine(line) {
  const result = [];
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

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Skip empty rows
    if (row['Memo/Description'] && row['Memo/Description'].trim() !== '') {
      rows.push(row);
    }
  }
  
  return { headers, rows };
}

function parseNumber(value) {
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

function extractAssetName(description, payee) {
  if (!description || description.trim() === '') {
    return payee || 'Unknown Asset';
  }
  
  let assetName = description.trim();
  
  // Remove common prefixes and transaction details
  assetName = assetName.replace(/^ORIG CO NAME:.*?TRN:\s*\w+\s*/i, '');
  assetName = assetName.replace(/^Device purchase.*?order\s*/i, 'Device - ');
  assetName = assetName.replace(/^Laptop purchase.*?order\s*/i, 'Laptop - ');
  
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

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') {
    return new Date().toISOString();
  }

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
  
  // Try to parse as a regular date
  const date = new Date(cleanDate);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  return new Date().toISOString();
}

function buildDepreciationSchedule(row, headers) {
  const depSchedule = {};
  const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  
  headers.forEach(header => {
    if (datePattern.test(header) && header !== 'Date' && header !== 'Date in place (Mid-month convention)') {
      const value = parseNumber(row[header]);
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

// Test the parser
try {
  const csvContent = fs.readFileSync('sample-new-format.csv', 'utf-8');
  const { headers, rows } = parseCSV(csvContent);
  
  console.log('Headers:', headers.slice(0, 10), '... and', headers.length - 10, 'more');
  console.log('Number of rows:', rows.length);
  
  const assets = [];
  const errors = [];
  
  rows.forEach((row, index) => {
    try {
      // Skip rows without essential data
      if (!row['Cost'] || parseNumber(row['Cost']) === 0) {
        console.log(`Skipping row ${index + 2}: No cost data`);
        return;
      }
      
      const cost = parseNumber(row['Cost'] || '0');
      const lifeMonths = parseNumber(row['# of life (months)'] || '36');
      const monthlyDep = parseNumber(row['Monthly Dep'] || '0');
      const accumDep = parseNumber(row['Accumulated Depreciation'] || '0');
      const nbv = parseNumber(row['NBV (YTD)'] || '0');
      
      // Extract asset name from description and payee
      const assetName = extractAssetName(
        row['Memo/Description'] || '', 
        row['Payee (Name)'] || ''
      );
      
      const asset = {
        id: generateId(),
        asset: assetName,
        dateInPlace: parseDate(row['Date in place (Mid-month convention)'] || row['Date'] || ''),
        account: row['Account'] || 'Computer Equipment',
        department: row['Class/Department'] || 'General',
        cost: Math.abs(cost),
        lifeMonths: lifeMonths || 36,
        monthlyDep: Math.abs(monthlyDep),
        accumDep: Math.abs(accumDep),
        nbv: nbv,
        depSchedule: buildDepreciationSchedule(row, headers)
      };
      
      if (asset.cost > 0 && asset.lifeMonths > 0) {
        assets.push(asset);
        console.log(`Asset ${index + 1}:`, asset.asset);
        console.log('  Cost:', asset.cost);
        console.log('  Department:', asset.department);
        console.log('  Dep Schedule entries:', Object.keys(asset.depSchedule).length);
        console.log('  Sample schedule:', Object.entries(asset.depSchedule).slice(0, 3));
        console.log('');
      } else {
        errors.push(`Row ${index + 2}: Invalid cost (${asset.cost}) or life months (${asset.lifeMonths})`);
      }
    } catch (error) {
      const errorMsg = `Error processing row ${index + 2}: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  });
  
  console.log(`\nSuccessfully parsed ${assets.length} assets with ${errors.length} errors`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(error => console.log('  -', error));
  }
  
  // Save to JSON for inspection
  const output = {
    assets,
    metadata: {
      totalAssets: assets.length,
      importDate: new Date().toISOString(),
      source: 'New Format CSV Test',
      errors
    }
  };
  
  fs.writeFileSync('test-new-output.json', JSON.stringify(output, null, 2));
  console.log(`\nSaved ${assets.length} assets to test-new-output.json`);
  
} catch (error) {
  console.error('Error:', error.message);
}
