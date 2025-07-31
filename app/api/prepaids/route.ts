import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// In-memory storage for when Firebase is not configured
// Using flexible type to match sample data structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let inMemoryPrepaids: any[] = [];
let isInMemoryInitialized = false;

// Sample data for fallback when Firebase is not configured
const samplePrepaids = [
  {
    id: '1',
    vendorId: '1',
    description: 'Annual Insurance Premium',
    initialAmount: 12000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    termMonths: 12,
    monthlyAmortization: 1000,
    currentBalance: 8000,
    amortizationSchedule: {
      '1/24': { month: '1/24', amortization: 1000, remainingBalance: 11000, isActual: true },
      '2/24': { month: '2/24', amortization: 1000, remainingBalance: 10000, isActual: true }
    },
    glAccount: '12100',
    expenseAccount: '61200',
    isActive: true,
    isFullyAmortized: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertFirestoreToPrepaid(doc: { id: string; data: () => Record<string, unknown> }): any {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    startDate: (data.startDate as any)?.toDate() || new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    endDate: (data.endDate as any)?.toDate() || new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: (data.createdAt as any)?.toDate() || new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: (data.updatedAt as any)?.toDate() || new Date()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    
    // Check if Firebase is properly configured
    if (!db || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'placeholder') {
      console.warn('Firebase not configured, using in-memory storage');
      
      // Initialize in-memory storage with sample data if not already done
      if (!isInMemoryInitialized) {
        inMemoryPrepaids = [...samplePrepaids];
        isInMemoryInitialized = true;
      }
      
      let filteredPrepaids = inMemoryPrepaids;
      
      if (isActive !== null) {
        filteredPrepaids = filteredPrepaids.filter(p => 
          p.isActive === (isActive === 'true')
        );
      }
      
      return NextResponse.json({ 
        prepaids: filteredPrepaids,
        total: filteredPrepaids.length,
        summary: {
          totalInitialAmount: filteredPrepaids.reduce((sum, p) => sum + p.initialAmount, 0),
          totalCurrentBalance: filteredPrepaids.reduce((sum, p) => sum + p.currentBalance, 0),
          totalMonthlyAmortization: filteredPrepaids.reduce((sum, p) => sum + p.monthlyAmortization, 0),
          activeCount: filteredPrepaids.filter(p => p.isActive).length
        }
      });
    }

    // Fetch from Firestore
    if (!db) {
      throw new Error('Database not initialized');
    }
    const prepaidsCollection = collection(db, 'prepaids');
    let prepaidsQuery = query(prepaidsCollection, orderBy('updatedAt', 'desc'));
    
    if (isActive !== null) {
      prepaidsQuery = query(prepaidsQuery, where('isActive', '==', isActive === 'true'));
    }
    
    const prepaidsSnapshot = await getDocs(prepaidsQuery);
    
    let prepaids = [];
    
    if (prepaidsSnapshot.empty) {
      // Initialize with sample data if collection is empty
      for (const samplePrepaid of samplePrepaids) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...prepaidData } = samplePrepaid;
        const docData = {
          ...prepaidData,
          startDate: Timestamp.fromDate(prepaidData.startDate),
          endDate: Timestamp.fromDate(prepaidData.endDate),
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        };
        await addDoc(prepaidsCollection, docData);
      }
      prepaids = samplePrepaids;
    } else {
      prepaids = prepaidsSnapshot.docs.map(convertFirestoreToPrepaid);
    }
    
    return NextResponse.json({ 
      prepaids,
      total: prepaids.length,
      summary: {
        totalInitialAmount: prepaids.reduce((sum, p) => sum + p.initialAmount, 0),
        totalCurrentBalance: prepaids.reduce((sum, p) => sum + p.currentBalance, 0),
        totalMonthlyAmortization: prepaids.reduce((sum, p) => sum + p.monthlyAmortization, 0),
        activeCount: prepaids.filter(p => p.isActive).length
      }
    });
  } catch (error) {
    console.error('Error fetching prepaids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prepaids' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.description || !body.initialAmount || !body.startDate || !body.termMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: description, initialAmount, startDate, termMonths' },
        { status: 400 }
      );
    }
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.warn('Firebase not configured, returning mock response');
      const newPrepaid = {
        id: Date.now().toString(),
        ...body,
        monthlyAmortization: body.initialAmount / body.termMonths,
        currentBalance: body.initialAmount,
        isActive: true,
        isFullyAmortized: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return NextResponse.json(newPrepaid, { status: 201 });
    }
    
    const now = Timestamp.fromDate(new Date());
    const startDate = new Date(body.startDate);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + body.termMonths, startDate.getDate());
    
    const prepaidData = {
      ...body,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      monthlyAmortization: body.initialAmount / body.termMonths,
      currentBalance: body.initialAmount,
      isActive: true,
      isFullyAmortized: false,
      createdAt: now,
      updatedAt: now
    };
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    const prepaidsCollection = collection(db, 'prepaids');
    const docRef = await addDoc(prepaidsCollection, prepaidData);
    
    const newPrepaid = {
      id: docRef.id,
      ...prepaidData,
      startDate: startDate,
      endDate: endDate,
      createdAt: now.toDate(),
      updatedAt: now.toDate()
    };
    
    return NextResponse.json(newPrepaid, { status: 201 });
  } catch (error) {
    console.error('Error creating prepaid:', error);
    return NextResponse.json(
      { error: 'Failed to create prepaid' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }
    
    const { id, ...updateData } = body;
    
    // Check if Firebase is properly configured
    if (!db || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'placeholder') {
      console.warn('Firebase not configured, updating in-memory storage');
      
      // Initialize in-memory storage if not already done
      if (!isInMemoryInitialized) {
        inMemoryPrepaids = [...samplePrepaids];
        isInMemoryInitialized = true;
      }
      
      // Find and update the prepaid in memory
      const index = inMemoryPrepaids.findIndex(p => p.id === id);
      if (index !== -1) {
        inMemoryPrepaids[index] = {
          ...inMemoryPrepaids[index],
          ...updateData,
          updatedAt: new Date()
        };
        return NextResponse.json({ success: true, prepaid: inMemoryPrepaids[index] });
      } else {
        return NextResponse.json({ error: 'Prepaid not found' }, { status: 404 });
      }
    }
    if (!db) {
      throw new Error('Database not initialized');
    }
    const prepaidRef = doc(db, 'prepaids', id);
    
    const updatePayload = {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    if (updateData.startDate) {
      updatePayload.startDate = Timestamp.fromDate(new Date(updateData.startDate));
    }
    
    if (updateData.endDate) {
      updatePayload.endDate = Timestamp.fromDate(new Date(updateData.endDate));
    }
    
    await updateDoc(prepaidRef, updatePayload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating prepaid:', error);
    return NextResponse.json(
      { error: 'Failed to update prepaid' },
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
    const prepaidRef = doc(db, 'prepaids', id);
    await deleteDoc(prepaidRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prepaid:', error);
    return NextResponse.json(
      { error: 'Failed to delete prepaid' },
      { status: 500 }
    );
  }
}
