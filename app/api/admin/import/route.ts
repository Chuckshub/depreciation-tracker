import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Asset } from '../../../../types/asset';

interface ValidationError {
  index: number;
  errors: string[];
}

interface ImportError {
  index: number;
  asset: string;
  error: string;
}

// This is a simple admin endpoint - in production, you should add proper authentication
// For now, we'll use a simple API key check
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key';

function validateAdminAccess(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');
  return apiKey === ADMIN_API_KEY;
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    if (!validateAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid API key required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, assets, clearExisting = true } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required. Supported actions: import, clear, stats' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'clear':
        return await handleClear();
      
      case 'import':
        if (!assets || !Array.isArray(assets)) {
          return NextResponse.json(
            { error: 'Assets array is required for import action' },
            { status: 400 }
          );
        }
        return await handleImport(assets, clearExisting);
      
      case 'stats':
        return await handleStats();
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Supported actions: import, clear, stats` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    if (!validateAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid API key required.' },
        { status: 401 }
      );
    }

    return await handleStats();
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleClear(): Promise<NextResponse> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const collectionRef = collection(db, 'assets');
  const snapshot = await getDocs(collectionRef);
  
  const deletePromises = snapshot.docs.map(docSnapshot => 
    deleteDoc(doc(db!, 'assets', docSnapshot.id))
  );
  
  await Promise.all(deletePromises);
  
  return NextResponse.json({
    success: true,
    message: `Cleared ${snapshot.docs.length} assets from database`,
    deletedCount: snapshot.docs.length
  });
}

async function handleImport(assets: Asset[], clearExisting: boolean): Promise<NextResponse> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  let deletedCount = 0;
  
  // Clear existing data if requested
  if (clearExisting) {
    const collectionRef = collection(db, 'assets');
    const snapshot = await getDocs(collectionRef);
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db!, 'assets', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    deletedCount = snapshot.docs.length;
  }
  
  // Validate assets
  const validAssets: Asset[] = [];
  const invalidAssets: ValidationError[] = [];
  
  assets.forEach((asset, index) => {
    const errors: string[] = [];
    
    if (!asset.asset || asset.asset.trim() === '') {
      errors.push('Asset name is required');
    }
    
    if (!asset.dateInPlace) {
      errors.push('Date in place is required');
    }
    
    if (typeof asset.cost !== 'number' || asset.cost < 0) {
      errors.push('Cost must be a non-negative number');
    }
    
    if (typeof asset.lifeMonths !== 'number' || asset.lifeMonths <= 0) {
      errors.push('Life months must be a positive number');
    }
    
    if (errors.length === 0) {
      validAssets.push(asset);
    } else {
      invalidAssets.push({ index, errors });
    }
  });
  
  // Import valid assets
  const collectionRef = collection(db, 'assets');
  let importedCount = 0;
  const importErrors: ImportError[] = [];
  
  // Import in batches
  const batchSize = 10;
  for (let i = 0; i < validAssets.length; i += batchSize) {
    const batch = validAssets.slice(i, i + batchSize);
    
    const importPromises = batch.map(async (asset, batchIndex) => {
      try {
        await addDoc(collectionRef, asset);
        importedCount++;
      } catch (error) {
        importErrors.push({
          index: i + batchIndex,
          asset: asset.asset,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    await Promise.all(importPromises);
  }
  
  return NextResponse.json({
    success: true,
    message: `Import completed. ${importedCount} assets imported successfully.`,
    summary: {
      totalProvided: assets.length,
      validAssets: validAssets.length,
      invalidAssets: invalidAssets.length,
      importedCount,
      deletedCount: clearExisting ? deletedCount : 0,
      importErrors: importErrors.length
    },
    details: {
      invalidAssets: invalidAssets.length > 0 ? invalidAssets : undefined,
      importErrors: importErrors.length > 0 ? importErrors : undefined
    }
  });
}

async function handleStats(): Promise<NextResponse> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const collectionRef = collection(db, 'assets');
  const snapshot = await getDocs(collectionRef);
  
  const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<Asset & { id: string }>;
  
  // Calculate some basic statistics
  const totalCost = assets.reduce((sum, asset) => sum + (asset.cost || 0), 0);
  const totalAccumDep = assets.reduce((sum, asset) => sum + (asset.accumDep || 0), 0);
  const totalNBV = assets.reduce((sum, asset) => sum + (asset.nbv || 0), 0);
  
  const departments = [...new Set(assets.map(asset => asset.department).filter(Boolean))];
  const accounts = [...new Set(assets.map(asset => asset.account).filter(Boolean))];
  
  return NextResponse.json({
    success: true,
    stats: {
      totalAssets: assets.length,
      totalCost,
      totalAccumDep,
      totalNBV,
      departments: departments.length,
      accounts: accounts.length
    },
    breakdown: {
      byDepartment: departments.map(dept => ({
        department: dept,
        count: assets.filter(asset => asset.department === dept).length
      })),
      byAccount: accounts.map(acc => ({
        account: acc,
        count: assets.filter(asset => asset.account === acc).length
      }))
    },
    sampleAssets: assets.slice(0, 5).map(asset => ({
      id: asset.id,
      asset: asset.asset,
      department: asset.department,
      cost: asset.cost,
      nbv: asset.nbv
    }))
  });
}
