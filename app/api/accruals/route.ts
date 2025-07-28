import { NextRequest, NextResponse } from 'next/server';
import { Accrual } from '@/types/accrual';

// Sample data for demonstration
const sampleAccruals: Accrual[] = [
  {
    id: '1',
    vendor: 'The Pipeline Group',
    description: 'Sales',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 40500.00,
    monthlyEntries: {
      '6/25': { reversal: -40500.00, accrual: 40500.00 },
      '7/25': { reversal: -40500.00, accrual: 40500.00 }
    },
    isActive: true
  },
  {
    id: '2',
    vendor: 'Pann Communication',
    description: 'Marketing',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 17245.00,
    monthlyEntries: {
      '6/25': { reversal: -17245.00, accrual: 17245.00 },
      '7/25': { reversal: -17245.00, accrual: 17245.00 }
    },
    isActive: true
  }
];

export async function GET() {
  try {
    return NextResponse.json({ 
      accruals: sampleAccruals,
      total: sampleAccruals.length,
      summary: {
        totalBalance: sampleAccruals.reduce((sum, a) => sum + a.balance, 0),
        activeAccruals: sampleAccruals.filter(a => a.isActive).length,
        vendorCount: new Set(sampleAccruals.map(a => a.vendor)).size
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch accruals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newAccrual: Accrual = {
      id: Date.now().toString(),
      vendor: body.vendor || '',
      description: body.description || '',
      accrualJEAccountDR: body.accrualJEAccountDR || '',
      accrualJEAccountCR: body.accrualJEAccountCR || '20005',
      balance: body.balance || 0,
      monthlyEntries: body.monthlyEntries || {},
      isActive: true
    };
    
    return NextResponse.json(newAccrual, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create accrual' },
      { status: 500 }
    );
  }
}