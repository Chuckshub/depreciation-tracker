import { NextRequest, NextResponse } from 'next/server';
import { Asset } from '../../../../types/asset';

interface JEExportData {
  assets: Asset[];
  selectedMonth: string;
}

interface JournalEntry {
  account: string;
  debit: number;
  credit: number;
  lineMemo: string;
  entity: string;
  department: string;
}

export async function POST(request: NextRequest) {
  try {
    const exportData: JEExportData = await request.json();
    
    // Generate journal entries grouped by department
    const journalEntries = generateJournalEntriesByDepartment(exportData);
    
    // Create CSV content
    const csvContent = createJECSVContent(journalEntries, exportData.selectedMonth);
    
    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="journal-entry-${exportData.selectedMonth}.csv"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error generating Journal Entry export:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate Journal Entry export',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateJournalEntriesByDepartment(data: JEExportData): JournalEntry[] {
  const { assets, selectedMonth } = data;
  const entries: JournalEntry[] = [];
  
  // Group assets by department and calculate totals
  const departmentTotals: Record<string, number> = {};
  
  assets.forEach(asset => {
    const monthlyDepreciation = asset.depSchedule[selectedMonth] || 0;
    if (monthlyDepreciation > 0) {
      const department = asset.department || 'General & Administrative';
      departmentTotals[department] = (departmentTotals[department] || 0) + monthlyDepreciation;
    }
  });
  
  // Determine asset type from the first asset (assuming all assets in the request are the same type)
  const assetType = assets.length > 0 ? assets[0].assetType : 'computer-equipment';
  
  // Create journal entries for each department
  Object.entries(departmentTotals).forEach(([department, total]) => {
    if (total > 0) {
      // Debit: 65910 - Depreciation
      entries.push({
        account: '65910 - Depreciation',
        debit: total,
        credit: 0,
        lineMemo: `${department} depreciation for ${formatMonthYear(selectedMonth)}`,
        entity: 'Coder Technologies',
        department: department
      });
      
      // Credit: Different accumulated depreciation accounts based on asset type
      const accumulatedDepAccount = assetType === 'furniture' 
        ? '15000-1 - Accumulated Depreciation - Furniture and Equipment'
        : '15003-1 - Accumulated Depreciation - Computer Equipment';
      
      entries.push({
        account: accumulatedDepAccount,
        debit: 0,
        credit: total,
        lineMemo: `${department} depreciation for ${formatMonthYear(selectedMonth)}`,
        entity: 'Coder Technologies',
        department: department
      });
    }
  });
  
  return entries;
}

function formatMonthYear(monthKey: string): string {
  const date = new Date(monthKey);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function createJECSVContent(journalEntries: JournalEntry[], selectedMonth: string): string {
  let content = '';
  
  // Add header
  content += `JOURNAL ENTRY - ${formatMonthYear(selectedMonth)}\n`;
  content += `Generated: ${new Date().toLocaleDateString('en-US')}\n\n`;
  
  // Add CSV headers
  content += 'Account,Debit,Credit,Line Memo,Entity,Department\n';
  
  // Add journal entries
  journalEntries.forEach(entry => {
    content += [
      `"${entry.account}"`,
      entry.debit.toFixed(2),
      entry.credit.toFixed(2),
      `"${entry.lineMemo}"`,
      `"${entry.entity}"`,
      `"${entry.department}"`
    ].join(',') + '\n';
  });
  
  return content;
}