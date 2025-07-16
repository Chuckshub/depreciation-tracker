'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AssetType } from '@/types/asset';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface UploadSummary {
  totalRows: number;
  validAssets: number;
  invalidAssets: number;
  importedCount: number;
  deletedCount: number;
  parseErrors: number;
}

interface UploadResult {
  success: boolean;
  message: string;
  summary?: UploadSummary;
  errors?: string[];
  invalidAssets?: Array<{ asset: { asset: string; cost: number; lifeMonths: number; [key: string]: string | number | boolean }, errors: string[] }>;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<AssetType>('computer-equipment');
  const [clearExisting, setClearExisting] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', assetType);
      formData.append('clearExisting', clearExisting.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResult = await response.json();
      setResult(data);

      if (data.success) {
        // Clear the file input on success
        setFile(null);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout title="Upload Data" subtitle="Import asset data from CSV or Excel files">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-gray-600">
                Import depreciation data from a CSV file into the database
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Assets
            </Link>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select CSV File</h2>
          
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {file ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">Upload a file</span>
                    <span> or drag and drop</span>
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        handleFileSelect(selectedFile);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mt-6">
            {/* Asset Type Selector */}
            <div className="mb-4">
              <label htmlFor="asset-type" className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <select
                id="asset-type"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="computer-equipment">Computer Equipment</option>
                <option value="furniture">Furniture</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the type of assets you&apos;re uploading
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="clear-existing"
                name="clear-existing"
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="clear-existing" className="ml-2 block text-sm text-gray-900">
                Clear existing data before import
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              If checked, all existing assets will be deleted before importing the new data
            </p>
          </div>

          {/* Upload Button */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !file || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {uploading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Upload and Import'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`rounded-lg p-6 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Import Successful' : 'Import Failed'}
                </h3>
                <div className={`mt-2 text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>{result.message}</p>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="mt-4">
                    <h4 className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Import Summary
                    </h4>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>Total rows processed: {result.summary.totalRows}</div>
                      <div>Valid assets: {result.summary.validAssets}</div>
                      <div>Successfully imported: {result.summary.importedCount}</div>
                      <div>Invalid assets: {result.summary.invalidAssets}</div>
                      {result.summary.deletedCount > 0 && (
                        <div>Existing assets deleted: {result.summary.deletedCount}</div>
                      )}
                      {result.summary.parseErrors > 0 && (
                        <div>Parse errors: {result.summary.parseErrors}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-red-800">Errors</h4>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                      {result.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>... and {result.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Invalid Assets */}
                {result.invalidAssets && result.invalidAssets.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-red-800">Invalid Assets</h4>
                    <div className="mt-2 text-sm text-red-700 space-y-2">
                      {result.invalidAssets.slice(0, 5).map((item, index) => (
                        <div key={index} className="border-l-2 border-red-300 pl-2">
                          <div className="font-medium">{item.asset.asset}</div>
                          <ul className="list-disc list-inside ml-2">
                            {item.errors.map((error, errorIndex) => (
                              <li key={errorIndex}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {result.invalidAssets.length > 5 && (
                        <div>... and {result.invalidAssets.length - 5} more invalid assets</div>
                      )}
                    </div>
                  </div>
                )}

                {result.success && (
                  <div className="mt-4">
                    <Link
                      href="/"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Imported Assets
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CSV Format Help */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h2>
          <div className="prose text-sm text-gray-600">
            <p>Your CSV file should include the following columns:</p>
            <ul className="mt-2 space-y-1">
              <li><strong>Memo/Description:</strong> Asset description or name</li>
              <li><strong>Payee (Name):</strong> Vendor or supplier name</li>
              <li><strong>Date in place (Mid-month convention):</strong> Date when asset was placed in service</li>
              <li><strong>Class/Department:</strong> Department or cost center</li>
              <li><strong>Cost:</strong> Original cost of the asset</li>
              <li><strong># of life (months):</strong> Useful life in months</li>
              <li><strong>Monthly Dep:</strong> Monthly depreciation amount</li>
              <li><strong>Accumulated Depreciation:</strong> Total depreciation to date</li>
              <li><strong>NBV (YTD):</strong> Net Book Value</li>
              <li><strong>Date columns:</strong> Monthly depreciation schedule (MM/DD/YY format)</li>
            </ul>
            <p className="mt-4">
              The system will automatically extract asset names from the description and payee fields,
              and build depreciation schedules from date columns in the CSV.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
