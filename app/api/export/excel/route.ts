import { NextRequest, NextResponse } from 'next/server';
import { Asset } from '../../../../types/asset';

interface ExportData {
  assets: Asset[];
  monthKeys: string[];
  monthlyTotals: number[];
  glBalances: Record<string, number>;
  monthlyVariances: number[];
  grandTotal: number;
}

interface JournalEntry {
  account: string;
  debit: number;
  credit: number;
  lineMemo: string;
  entity: string;
  department: string;
  class: string;
  location: string;
}

export async function POST(request: NextRequest) {
  try {
    const exportData: ExportData = await request.json();
    
    // Generate Excel-like CSV data
    const csvData = generateCSVData(exportData);
    
    // Generate journal entries
    const journalEntries = generateJournalEntries(exportData);
    
    // Create a simple CSV format (we'll enhance this to actual Excel later)
    const csvContent = createCSVContent(csvData, journalEntries);
    
    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="depreciation-reconciliation-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate Excel export',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateCSVData(data: ExportData) {
  const { assets, monthKeys, monthlyTotals, glBalances, monthlyVariances } = data;
  
  // Create header row
  const headers = [
    'Asset',
    'Account', 
    'Department',
    'Date in Place',
    ...monthKeys.map(key => {
      const date = new Date(key);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    'Total'
  ];
  
  // Create data rows
  const rows = [];
  
  // Asset rows
  assets.forEach(asset => {
    const row = [
      asset.asset,
      asset.account,
      asset.department,
      new Date(asset.dateInPlace).toLocaleDateString('en-US'),
      ...monthKeys.map(monthKey => {
        const amount = asset.depSchedule[monthKey] ?? 0;
        return amount.toFixed(2);
      }),
      monthKeys.reduce((total, monthKey) => {
        return total + (asset.depSchedule[monthKey] ?? 0);
      }, 0).toFixed(2)
    ];
    rows.push(row);
  });
  
  // Monthly Total row
  const monthlyTotalRow = [
    'Monthly Total',
    '', '', '',
    ...monthlyTotals.map(total => total.toFixed(2)),
    data.grandTotal.toFixed(2)
  ];
  rows.push(monthlyTotalRow);
  
  // GL Balance row
  const glBalanceRow = [
    'GL Balance',
    '', '', '',
    ...monthKeys.map(monthKey => (glBalances[monthKey] || 0).toFixed(2)),
    Object.values(glBalances).reduce((sum, val) => sum + val, 0).toFixed(2)
  ];
  rows.push(glBalanceRow);
  
  // Variance row
  const varianceRow = [
    'Variance',
    '', '', '',
    ...monthlyVariances.map(variance => variance.toFixed(2)),
    monthlyVariances.reduce((sum, variance) => sum + variance, 0).toFixed(2)
  ];
  rows.push(varianceRow);
  
  return { headers, rows };
}

function generateJournalEntries(data: ExportData): JournalEntry[] {
  const { monthlyTotals } = data;
  const entries: JournalEntry[] = [];
  
  // Calculate total depreciation for the period
  const totalDepreciation = monthlyTotals.reduce((sum, total) => sum + total, 0);
  
  if (totalDepreciation > 0) {
    // Debit: Depreciation Expense
    entries.push({
      account: '60003 - Depreciation Expense',
      debit: totalDepreciation,
      credit: 0,
      lineMemo: 'Monthly depreciation expense',
      entity: 'Coder Technologies',
      department: 'General & Administrative',
      class: 'Operating Expense',
      location: 'Main Office'
    });
    
    // Credit: Accumulated Depreciation - Computer Equipment
    entries.push({
      account: '15003-1 - Accumulated Depreciation - Computer Equipment',
      debit: 0,
      credit: totalDepreciation,
      lineMemo: 'Monthly depreciation expense',
      entity: 'Coder Technologies',
      department: 'General & Administrative',
      class: 'Contra Asset',
      location: 'Main Office'
    });
  }
  
  return entries;
}

function createCSVContent(csvData: { headers: string[], rows: string[][] }, journalEntries: JournalEntry[]): string {
  let content = '';
  
  // Add depreciation schedule
  content += 'DEPRECIATION RECONCILIATION\n';
  content += `Generated: ${new Date().toLocaleDateString('en-US')}\n\n`;
  
  // Add headers
  content += csvData.headers.join(',') + '\n';
  
  // Add data rows
  csvData.rows.forEach(row => {
    content += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  // Add journal entries section
  content += '\n\nJOURNAL ENTRIES\n';
  content += 'Account,Debit,Credit,Line Memo,Entity,Department,Class,Location\n';
  
  journalEntries.forEach(entry => {
    content += [
      `"${entry.account}"`,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      `"${entry.lineMemo}"`,
      `"${entry.entity}"`,
      `"${entry.department}"`,
      `"${entry.class}"`,
      `"${entry.location}"`
    ].join(',') + '\n';
  });
  
  return content;
}