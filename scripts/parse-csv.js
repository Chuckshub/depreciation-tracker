const fs = require('fs');
const path = require('path');

// Sample of the actual CSV data provided by the user
const sampleAssets = [
  {
    id: "asset-001",
    asset: "Kyle Carberry - MacBook Pro",
    dateInPlace: "2023-02-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "Research & Development : Research Engineering",
    cost: 1517.21,
    lifeMonths: 36,
    monthlyDep: 42.14,
    accumDep: 1222,
    nbv: 295.21,
    depSchedule: {
      "01/01/2025": 42.14,
      "02/01/2025": 42.14,
      "03/01/2025": 42.14,
      "04/01/2025": 42.14,
      "05/01/2025": 42.14,
      "06/01/2025": 42.14,
      "07/01/2025": 42.14,
      "08/01/2025": 42.14,
      "09/01/2025": 42.14,
      "10/01/2025": 42.14,
      "11/01/2025": 42.14,
      "12/01/2025": 42.14
    }
  },
  {
    id: "asset-002",
    asset: "Enterprise Engineering Team - MacBook Pro",
    dateInPlace: "2023-05-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "Research & Development : Enterprise Engineering",
    cost: 2147.95,
    lifeMonths: 36,
    monthlyDep: 59.67,
    accumDep: 1551,
    nbv: 596.95,
    depSchedule: {
      "01/01/2025": 59.67,
      "02/01/2025": 59.67,
      "03/01/2025": 59.67,
      "04/01/2025": 59.67,
      "05/01/2025": 59.67,
      "06/01/2025": 59.67,
      "07/01/2025": 59.67,
      "08/01/2025": 59.67,
      "09/01/2025": 59.67,
      "10/01/2025": 59.67,
      "11/01/2025": 59.67,
      "12/01/2025": 59.67
    }
  },
  {
    id: "asset-003",
    asset: "CEO Office - MacBook Pro",
    dateInPlace: "2023-05-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "General & Administrative : CEO Office",
    cost: 2719.18,
    lifeMonths: 36,
    monthlyDep: 75.53,
    accumDep: 1964,
    nbv: 755.18,
    depSchedule: {
      "01/01/2025": 75.53,
      "02/01/2025": 75.53,
      "03/01/2025": 75.53,
      "04/01/2025": 75.53,
      "05/01/2025": 75.53,
      "06/01/2025": 75.53,
      "07/01/2025": 75.53,
      "08/01/2025": 75.53,
      "09/01/2025": 75.53,
      "10/01/2025": 75.53,
      "11/01/2025": 75.53,
      "12/01/2025": 75.53
    }
  },
  {
    id: "asset-004",
    asset: "Research Engineering - MacBook Pro",
    dateInPlace: "2023-06-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "Research & Development : Research Engineering",
    cost: 1549.42,
    lifeMonths: 36,
    monthlyDep: 43.04,
    accumDep: 1076,
    nbv: 473.42,
    depSchedule: {
      "01/01/2025": 43.04,
      "02/01/2025": 43.04,
      "03/01/2025": 43.04,
      "04/01/2025": 43.04,
      "05/01/2025": 43.04,
      "06/01/2025": 43.04,
      "07/01/2025": 43.04,
      "08/01/2025": 43.04,
      "09/01/2025": 43.04,
      "10/01/2025": 43.04,
      "11/01/2025": 43.04,
      "12/01/2025": 43.04
    }
  },
  {
    id: "asset-005",
    asset: "Enterprise Engineering - MacBook Pro",
    dateInPlace: "2023-06-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "Research & Development : Enterprise Engineering",
    cost: 1514.42,
    lifeMonths: 36,
    monthlyDep: 42.07,
    accumDep: 1052,
    nbv: 462.42,
    depSchedule: {
      "01/01/2025": 42.07,
      "02/01/2025": 42.07,
      "03/01/2025": 42.07,
      "04/01/2025": 42.07,
      "05/01/2025": 42.07,
      "06/01/2025": 42.07,
      "07/01/2025": 42.07,
      "08/01/2025": 42.07,
      "09/01/2025": 42.07,
      "10/01/2025": 42.07,
      "11/01/2025": 42.07,
      "12/01/2025": 42.07
    }
  },
  {
    id: "asset-006",
    asset: "Finance & Accounting - MacBook Pro",
    dateInPlace: "2023-07-01T00:00:00.000Z",
    account: "15003 - Computer Equipment",
    department: "General & Administrative : Finance & Accounting",
    cost: 1775.91,
    lifeMonths: 36,
    monthlyDep: 49.33,
    accumDep: 1184,
    nbv: 591.91,
    depSchedule: {
      "01/01/2025": 49.33,
      "02/01/2025": 49.33,
      "03/01/2025": 49.33,
      "04/01/2025": 49.33,
      "05/01/2025": 49.33,
      "06/01/2025": 49.33,
      "07/01/2025": 49.33,
      "08/01/2025": 49.33,
      "09/01/2025": 49.33,
      "10/01/2025": 49.33,
      "11/01/2025": 49.33,
      "12/01/2025": 49.33
    }
  }
];

// Write to JSON file
const outputPath = path.join(__dirname, '..', 'public', 'parsed_assets.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleAssets, null, 2));

console.log(`Created ${sampleAssets.length} sample assets and saved to ${outputPath}`);
console.log('Sample asset:', JSON.stringify(sampleAssets[0], null, 2));
