import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accrual, CreateAccrualRequest, UpdateAccrualRequest } from '@/types/accrual';

// Sample data for fallback when Firebase is not configured
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function convertFirestoreToAccrual(doc: { id: string; data: () => Record<string, unknown> }): Accrual {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: (data.createdAt as any)?.toDate() || new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: (data.updatedAt as any)?.toDate() || new Date()
  } as Accrual;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor = searchParams.get('vendor');
    const isActive = searchParams.get('isActive');
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn('Firebase not configured, returning sample data');
      let filteredAccruals = sampleAccruals;
      
      if (vendor) {
        filteredAccruals = filteredAccruals.filter(a => 
          a.vendor.toLowerCase().includes(vendor.toLowerCase())
        );
      }
      
      if (isActive !== null) {
        filteredAccruals = filteredAccruals.filter(a => 
          a.isActive === (isActive === 'true')
        );
      }
      
      return NextResponse.json({ 
        accruals: filteredAccruals,
        total: filteredAccruals.length,
        summary: {
          totalBalance: filteredAccruals.reduce((sum, a) => sum + a.balance, 0),
          activeAccruals: filteredAccruals.filter(a => a.isActive).length,
          vendorCount: new Set(filteredAccruals.map(a => a.vendor)).size
        }
      });
    }

    // Fetch from Firestore
    if (!db) {
      throw new Error('Database not initialized');
    }
    const accrualsCollection = collection(db, 'accruals');
    let accrualsQuery = query(accrualsCollection, orderBy('updatedAt', 'desc'));
    
    // Apply filters
    if (isActive !== null) {
      accrualsQuery = query(accrualsQuery, where('isActive', '==', isActive === 'true'));
    }
    
    const accrualsSnapshot = await getDocs(accrualsQuery);
    
    let accruals: Accrual[] = [];
    
    if (accrualsSnapshot.empty) {
      // Initialize with sample data if collection is empty
      for (const sampleAccrual of sampleAccruals) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...accrualData } = sampleAccrual;
        const docData = {
          ...accrualData,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };
        await addDoc(accrualsCollection, docData);
      }
      accruals = sampleAccruals;
    } else {
      accruals = accrualsSnapshot.docs.map(convertFirestoreToAccrual);
      
      // Apply client-side vendor filter (since Firestore doesn't support case-insensitive contains)
      if (vendor) {
        accruals = accruals.filter(a => 
          a.vendor.toLowerCase().includes(vendor.toLowerCase())
        );
      }
    }
    
    return NextResponse.json({ 
      accruals,
      total: accruals.length,
      summary: {
        totalBalance: accruals.reduce((sum, a) => sum + a.balance, 0),
        activeAccruals: accruals.filter(a => a.isActive).length,
        vendorCount: new Set(accruals.map(a => a.vendor)).size
      }
    });
  } catch (error) {
    console.error('Error fetching accruals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accruals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAccrualRequest = await request.json();
    
    // Validate required fields
    if (!body.vendor || !body.description || !body.accrualJEAccountDR || !body.accrualJEAccountCR) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor, description, accrualJEAccountDR, accrualJEAccountCR' },
        { status: 400 }
      );
    }
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn('Firebase not configured, returning mock response');
      const newAccrual: Accrual = {
        id: Date.now().toString(),
        vendor: body.vendor,
        description: body.description,
        accrualJEAccountDR: body.accrualJEAccountDR,
        accrualJEAccountCR: body.accrualJEAccountCR,
        balance: body.balance || 0,
        monthlyEntries: body.monthlyEntries || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: body.notes
      };
      return NextResponse.json(newAccrual, { status: 201 });
    }
    
    const now = Timestamp.fromDate(new Date());
    const accrualData = {
      vendor: body.vendor,
      description: body.description,
      accrualJEAccountDR: body.accrualJEAccountDR,
      accrualJEAccountCR: body.accrualJEAccountCR,
      balance: body.balance || 0,
      monthlyEntries: body.monthlyEntries || {},
      isActive: true,
      createdAt: now,
      updatedAt: now,
      notes: body.notes || ''
    };
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    const accrualsCollection = collection(db, 'accruals');
    const docRef = await addDoc(accrualsCollection, accrualData);
    
    const newAccrual: Accrual = {
      id: docRef.id,
      ...accrualData,
      createdAt: now.toDate(),
      updatedAt: now.toDate()
    };
    
    return NextResponse.json(newAccrual, { status: 201 });
  } catch (error) {
    console.error('Error creating accrual:', error);
    return NextResponse.json(
      { error: 'Failed to create accrual' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateAccrualRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn('Firebase not configured, returning mock response');
      return NextResponse.json({ success: true });
    }
    
    const { id, ...updateData } = body;
    if (!db) {
      throw new Error('Database not initialized');
    }
    const accrualRef = doc(db, 'accruals', id);
    
    const updatePayload = {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    await updateDoc(accrualRef, updatePayload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating accrual:', error);
    return NextResponse.json(
      { error: 'Failed to update accrual' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn('Firebase not configured, returning mock response');
      return NextResponse.json({ success: true });
    }
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    const accrualRef = doc(db, 'accruals', id);
    await deleteDoc(accrualRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting accrual:', error);
    return NextResponse.json(
      { error: 'Failed to delete accrual' },
      { status: 500 }
    );
  }
}