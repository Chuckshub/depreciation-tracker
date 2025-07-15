const fs = require('fs');

// Simple CSV parser test
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
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return { headers, rows };
}

function parseDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString();
}

function parseNumber(value) {
  const cleaned = value.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function buildDepreciationSchedule(row, headers) {
  const depSchedule = {};
  const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  
  headers.forEach(header => {
    if (datePattern.test(header) && header !== 'Date In Place') {
      const value = parseNumber(row[header]);
      if (value !== 0) {
        depSchedule[header] = value;
      }
    }
  });
  
  return depSchedule;
}

// Test the parser
try {
  const csvContent = fs.readFileSync('sample-data.csv', 'utf-8');
  const { headers, rows } = parseCSV(csvContent);
  
  console.log('Headers:', headers);
  console.log('Number of rows:', rows.length);
  
  const assets = rows.map((row, index) => {
    const asset = {
      id: generateId(),
      asset: row['Asset'] || '',
      dateInPlace: row['Date In Place'] ? parseDate(row['Date In Place']) : new Date().toISOString(),
      account: row['Account'] || '',
      department: row['Department'] || '',
      cost: parseNumber(row['Cost'] || '0'),
      lifeMonths: parseNumber(row['Life Months'] || '0'),
      monthlyDep: parseNumber(row['Monthly Dep'] || '0'),
      accumDep: parseNumber(row['Accum Dep'] || '0'),
      nbv: parseNumber(row['NBV'] || '0'),
      depSchedule: buildDepreciationSchedule(row, headers)
    };
    
    console.log(`Asset ${index + 1}:`, asset.asset);
    console.log('  Cost:', asset.cost);
    console.log('  Department:', asset.department);
    console.log('  Dep Schedule:', Object.keys(asset.depSchedule).length, 'entries');
    
    return asset;
  });
  
  // Save to JSON
  const output = {
    assets,
    metadata: {
      totalAssets: assets.length,
      importDate: new Date().toISOString(),
      source: 'CSV Test'
    }
  };
  
  fs.writeFileSync('test-output.json', JSON.stringify(output, null, 2));
  console.log(`\nSuccessfully parsed ${assets.length} assets and saved to test-output.json`);
  
} catch (error) {
  console.error('Error:', error.message);
}
