import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Asset } from '../../../types/asset';
import { WebCSVParser } from '../../../lib/csv-parser-web';

interface UploadResponse {
  success: boolean;
  message: string;
  summary?: {
    totalRows: number;
    validAssets: number;
    invalidAssets: number;
    importedCount: number;
    deletedCount: number;
    parseErrors: number;
  };
  errors?: string[];
  invalidAssets?: Array<{ asset: Asset, errors: string[] }>;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clearExisting = formData.get('clearExisting') === 'true';
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        message: 'File must be a CSV file'
      }, { status: 400 });
    }
    
    // Read file content
    const csvContent = await file.text();
    
    if (!csvContent.trim()) {
      return NextResponse.json({
        success: false,
        message: 'CSV file is empty'
      }, { status: 400 });
    }
    
    console.log(`Processing CSV file: ${file.name} (${file.size} bytes)`);
    
    // Parse CSV content
    const { assets, errors: parseErrors } = WebCSVParser.parseCSVToAssets(csvContent);
    
    if (assets.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid assets found in CSV file',
        errors: parseErrors
      }, { status: 400 });
    }
    
    // Validate assets
    const { valid, invalid } = WebCSVParser.validateAssets(assets);
    
    if (valid.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid assets after validation',
        errors: parseErrors,
        invalidAssets: invalid
      }, { status: 400 });
    }
    
    let deletedCount = 0;
    
    // Clear existing data if requested
    if (clearExisting) {
      console.log('Clearing existing assets...');
      const collectionRef = collection(db, 'assets');
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.docs.length > 0) {
        const deletePromises = snapshot.docs.map(docSnapshot => 
          deleteDoc(doc(db, 'assets', docSnapshot.id))
        );
        
        await Promise.all(deletePromises);
        deletedCount = snapshot.docs.length;
        console.log(`Deleted ${deletedCount} existing assets`);
      }
    }
    
    // Import valid assets
    console.log(`Importing ${valid.length} valid assets...`);
    const collectionRef = collection(db, 'assets');
    let importedCount = 0;
    const importErrors: string[] = [];
    
    // Import in batches to avoid overwhelming Firestore
    const batchSize = 10;
    for (let i = 0; i < valid.length; i += batchSize) {
      const batch = valid.slice(i, i + batchSize);
      
      const importPromises = batch.map(async (asset) => {
        try {
          await addDoc(collectionRef, asset);
          importedCount++;
          console.log(`Imported: ${asset.asset}`);
        } catch (error) {
          const errorMsg = `Failed to import asset: ${asset.asset} - ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          importErrors.push(errorMsg);
        }
      });
      
      await Promise.all(importPromises);
      
      // Small delay between batches
      if (i + batchSize < valid.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const response: UploadResponse = {
      success: true,
      message: `Successfully imported ${importedCount} assets from CSV file`,
      summary: {
        totalRows: assets.length,
        validAssets: valid.length,
        invalidAssets: invalid.length,
        importedCount,
        deletedCount,
        parseErrors: parseErrors.length
      }
    };
    
    // Include errors and invalid assets if any
    if (parseErrors.length > 0 || importErrors.length > 0) {
      response.errors = [...parseErrors, ...importErrors];
    }
    
    if (invalid.length > 0) {
      response.invalidAssets = invalid;
    }
    
    console.log('Import completed:', response.summary);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during file processing',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
