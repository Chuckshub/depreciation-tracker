import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface GLBalancesData {
  glBalances: Record<string, number>;
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return NextResponse.json({
        success: false,
        message: 'Firebase is not configured. GL balances will not be saved.'
      }, { status: 500 });
    }

    const { glBalances } = await request.json();
    
    if (!glBalances || typeof glBalances !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'Invalid GL balances data'
      }, { status: 400 });
    }

    // Save GL balances to Firestore
    const glBalancesRef = doc(db, 'settings', 'gl-balances');
    const glBalancesData: GLBalancesData = {
      glBalances,
      lastUpdated: new Date().toISOString()
    };

    await setDoc(glBalancesRef, glBalancesData);

    console.log('GL balances saved successfully');

    return NextResponse.json({
      success: true,
      message: 'GL balances saved successfully'
    });

  } catch (error) {
    console.error('Error saving GL balances:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return NextResponse.json({
        success: true,
        glBalances: {},
        message: 'Firebase not configured, returning empty GL balances'
      });
    }

    // Get GL balances from Firestore
    const glBalancesRef = doc(db, 'settings', 'gl-balances');
    const glBalancesDoc = await getDoc(glBalancesRef);

    if (glBalancesDoc.exists()) {
      const data = glBalancesDoc.data() as GLBalancesData;
      return NextResponse.json({
        success: true,
        glBalances: data.glBalances || {},
        lastUpdated: data.lastUpdated
      });
    } else {
      return NextResponse.json({
        success: true,
        glBalances: {},
        message: 'No GL balances found'
      });
    }

  } catch (error) {
    console.error('Error fetching GL balances:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
