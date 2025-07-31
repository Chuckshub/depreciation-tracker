import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Asset } from '../../../../types/asset';

export async function PUT(request: NextRequest) {
  try {
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return NextResponse.json({
        success: false,
        message: 'Firebase is not configured. Cannot update assets.'
      }, { status: 500 });
    }

    const asset: Asset = await request.json();
    
    if (!asset.id) {
      return NextResponse.json({
        success: false,
        message: 'Asset ID is required'
      }, { status: 400 });
    }

    // Get the document reference
    if (!db) {
      throw new Error('Database not initialized');
    }
    const assetRef = doc(db, 'assets', asset.id);
    
    // Check if the document exists
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: 'Asset not found'
      }, { status: 404 });
    }

    // Update the document
    await updateDoc(assetRef, {
      dateInPlace: asset.dateInPlace,
      lifeMonths: asset.lifeMonths,
      monthlyDep: asset.monthlyDep,
      // Update other fields that might have changed
      cost: asset.cost,
      accumDep: asset.accumDep,
      nbv: asset.nbv,
      depSchedule: asset.depSchedule
    });

    console.log(`Updated asset: ${asset.asset}`);

    return NextResponse.json({
      success: true,
      message: 'Asset updated successfully',
      asset
    });

  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
