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
  class: string;
  location: string;
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
        department: department,
        class: 'Operating Expense',
        location: 'Main Office'
      });
      
      // Credit: Accumulated Depreciation - Computer Equipment
      entries.push({
        account: '15003-1 - Accumulated Depreciation - Computer Equipment',
        debit: 0,
        credit: total,
        lineMemo: `${department} depreciation for ${formatMonthYear(selectedMonth)}`,
        entity: 'Coder Technologies',
        department: department,
        class: 'Contra Asset',
        location: 'Main Office'
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
  content += 'Account,Debit,Credit,Line Memo,Entity,Department,Class,Location\n';
  
  // Add journal entries
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