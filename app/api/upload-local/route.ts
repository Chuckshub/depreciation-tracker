import { NextRequest, NextResponse } from 'next/server';
import { WebCSVParser } from '../../../lib/csv-parser-web';
import { Asset, AssetType } from '../../../types/asset';

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
  assets?: Asset[];
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const assetType = (formData.get('assetType') as AssetType) || 'computer-equipment';
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
    const { assets, errors: parseErrors } = WebCSVParser.parseCSVToAssets(csvContent, assetType);
    
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
        errors: parseErrors
      }, { status: 400 });
    }
    
    // For local development, return the parsed assets
    // The frontend will handle storing them in localStorage
    const response: UploadResponse = {
      success: true,
      message: `Successfully parsed ${valid.length} assets from CSV file`,
      summary: {
        totalRows: assets.length,
        validAssets: valid.length,
        invalidAssets: invalid.length,
        importedCount: valid.length,
        deletedCount: clearExisting ? 1 : 0, // Placeholder
        parseErrors: parseErrors.length
      },
      assets: valid
    };
    
    // Include errors if any
    if (parseErrors.length > 0) {
      response.errors = parseErrors;
    }
    
    console.log('Parse completed:', response.summary);
    
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
