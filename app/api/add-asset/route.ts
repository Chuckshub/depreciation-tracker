import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Asset } from '../../../types/asset';

function generateDepreciationSchedule(monthlyDep: number, dateInPlace: string, lifeMonths: number): Record<string, number> {
  const schedule: Record<string, number> = {};
  const startDate = new Date(dateInPlace);
  
  for (let i = 0; i < lifeMonths; i++) {
    const scheduleDate = new Date(startDate);
    scheduleDate.setMonth(scheduleDate.getMonth() + i);
    
    // Format as MM/DD/YYYY
    const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
    const day = '01'; // Always use first of month
    const year = scheduleDate.getFullYear();
    const dateKey = `${month}/${day}/${year}`;
    
    schedule[dateKey] = monthlyDep;
  }
  
  return schedule;
}

function generateAssetId(existingAssets: Asset[]): string {
  const maxId = existingAssets.reduce((max, asset) => {
    const idNum = parseInt(asset.id.replace('asset-', ''));
    return idNum > max ? idNum : max;
  }, 0);
  
  return `asset-${String(maxId + 1).padStart(3, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { asset, account, department, cost, lifeMonths, dateInPlace } = body;
    
    if (!asset || !account || !department || !cost || !lifeMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: asset, account, department, cost, lifeMonths' },
        { status: 400 }
      );
    }
    
    // Get existing assets from Firestore
    const assetsCollection = collection(db, 'assets');
    const assetsSnapshot = await getDocs(assetsCollection);
    const existingAssets: Asset[] = assetsSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().id || doc.id
    })) as Asset[];
    
    // Calculate depreciation values
    const monthlyDep = cost / lifeMonths;
    const assetDateInPlace = dateInPlace || new Date().toISOString();
    
    // Calculate accumulated depreciation based on months since in place
    const inPlaceDate = new Date(assetDateInPlace);
    const currentDate = new Date();
    const monthsElapsed = Math.max(0, 
      (currentDate.getFullYear() - inPlaceDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - inPlaceDate.getMonth())
    );
    
    const accumDep = Math.min(monthlyDep * monthsElapsed, cost);
    const nbv = cost - accumDep;
    
    // Create new asset
    const newAsset: Asset = {
      id: generateAssetId(existingAssets),
      asset,
      dateInPlace: assetDateInPlace,
      account,
      department,
      cost: parseFloat(cost),
      lifeMonths: parseInt(lifeMonths),
      monthlyDep: Math.round(monthlyDep * 100) / 100,
      accumDep: Math.round(accumDep * 100) / 100,
      nbv: Math.round(nbv * 100) / 100,
      assetType: 'computer-equipment', // Default to computer equipment for now
      depSchedule: generateDepreciationSchedule(monthlyDep, assetDateInPlace, parseInt(lifeMonths))
    };
    
    // Add new asset to Firestore
    await addDoc(assetsCollection, newAsset);
    
    return NextResponse.json({ 
      success: true, 
      asset: newAsset,
      totalAssets: existingAssets.length + 1
    });
    
  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json(
      { error: 'Failed to add asset' },
      { status: 500 }
    );
  }
}
