import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Asset, AssetType } from '../../../types/asset';

// Sample assets to initialize KV if empty
const sampleAssets: Asset[] = [
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
    assetType: 'computer-equipment' as AssetType,
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
    assetType: 'computer-equipment' as AssetType,
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
    assetType: 'computer-equipment' as AssetType,
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
    assetType: 'computer-equipment' as AssetType,
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
    assetType: 'computer-equipment' as AssetType,
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
    assetType: 'computer-equipment' as AssetType,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get('assetType') as AssetType | null;
    
    // Check if Firebase is properly configured
    if (!db || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'placeholder') {
      console.warn('Firebase not configured, returning sample data');
      const filteredAssets = assetType 
        ? sampleAssets.filter(asset => asset.assetType === assetType)
        : sampleAssets;
      return NextResponse.json({ assets: filteredAssets });
    }

    // Try to get assets from Firestore
    const assetsCollection = collection(db, 'assets');
    const assetsSnapshot = await getDocs(assetsCollection);
    
    let assets: Asset[] = [];
    
    if (assetsSnapshot.empty) {
      // If no assets exist, initialize with sample data
      for (const sampleAsset of sampleAssets) {
        await addDoc(assetsCollection, sampleAsset);
      }
      assets = sampleAssets;
    } else {
      // Convert Firestore documents to Asset objects
      assets = assetsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().id || doc.id // Use the asset's id field or fallback to doc id
      })) as Asset[];
      
      // Filter by asset type if specified
      if (assetType) {
        assets = assets.filter(asset => asset.assetType === assetType);
      }
    }
    
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    
    // Fallback to sample data if Firestore is not available
    return NextResponse.json({ 
      assets: sampleAssets,
      error: 'Fallback to sample data due to database error'
    }, { status: 200 }); // Return 200 with fallback data instead of error
  }
}
