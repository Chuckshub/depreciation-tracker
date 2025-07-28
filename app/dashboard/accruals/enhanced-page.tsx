"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Upload, BarChart3, Table, Download, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { useState, useRef, useCallback } from "react"
import { 
  Accrual, 
  AccrualCSVImportResult 
} from "@/types/accrual"
import { EnhancedAccrualsTable } from "@/components/accruals/enhanced-accruals-table"
import { AccrualUtils } from "@/lib/accrual-utils"

// Enhanced sample data with more realistic entries
const enhancedSampleAccruals: Accrual[] = [
  {
    id: 'accrual_001',
    vendor: 'The Pipeline Group',
    description: 'Sales Commission',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 40500.00,
    monthlyEntries: {
      '6/25': { reversal: -40500.00, accrual: 40500.00 },
      '7/25': { reversal: -40500.00, accrual: 40500.00 }
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    isActive: true,
    notes: 'Monthly sales commission accrual'
  },
  {
    id: 'accrual_002',
    vendor: 'Pann Communication',
    description: 'Marketing Services',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 17245.00,
    monthlyEntries: {
      '6/25': { reversal: -17245.00, accrual: 17245.00 },
      '7/25': { reversal: -17245.00, accrual: 17245.00 }
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: 'accrual_003',
    vendor: 'LinkedIn Corporation',
    description: 'Demand Generation Advertising',
    accrualJEAccountDR: '66070',
    accrualJEAccountCR: '20005',
    balance: 52925.05,
    monthlyEntries: {
      '6/25': { reversal: -31319.87, accrual: 52925.05 },
      '7/25': { reversal: -52925.05, accrual: 52925.05 }
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    isActive: true,
    notes: 'LinkedIn advertising spend'
  },
  {
    id: 'accrual_004',
    vendor: 'DoIt Cloud Services',
    description: 'Cloud Infrastructure Costs',
    accrualJEAccountDR: '66070',
    accrualJEAccountCR: '20005',
    balance: 14765.91,
    monthlyEntries: {
      '6/25': { reversal: -18000.00, accrual: 14765.91 },
      '7/25': { reversal: -14765.91, accrual: 14765.91 }
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: 'accrual_005',
    vendor: 'Together Holdings',
    description: 'Marketing Consulting',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 24598.17,
    monthlyEntries: {
      '7/25': { reversal: -24598.17, accrual: 24598.17 }
    },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date(),
    isActive: true
  }
]

export default function EnhancedAccrualsPage() {
  const [accruals, setAccruals] = useState<Accrual[]>(enhancedSampleAccruals)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<AccrualCSVImportResult | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'summary'>('table')
  const [balanceSheetAmount, setBalanceSheetAmount] = useState<number>(162034.13)
  const [showUploadResult, setShowUploadResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate summary using utility function
  const summary = AccrualUtils.calculateSummary(accruals, balanceSheetAmount)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      // For demo purposes, simulate parsing
      // In real implementation, use: EnhancedAccrualsCSVParser.parseCSVToAccruals(await file.text())
      const result = {
        accruals: [],
        errors: [],
        warnings: [],
        summary: {
          totalRows: 0,
          successfulImports: 0,
          failedImports: 0,
          skippedRows: 0
        }
      } as AccrualCSVImportResult
      
      // For demo purposes, simulate parsing
      // In real implementation, use: EnhancedAccrualsCSVParser.parseCSVToAccruals(text)
      
      if (result.accruals.length > 0) {
        setAccruals(prev => [...prev, ...result.accruals])
      }
      
      setUploadResult(result)
      setShowUploadResult(true)
      
    } catch (error) {
      setUploadResult({
        accruals: [],
        errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        summary: {
          totalRows: 0,
          successfulImports: 0,
          failedImports: 1,
          skippedRows: 0
        }
      })
      setShowUploadResult(true)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  const handleDataChange = useCallback((newData: Accrual[]) => {
    setAccruals(newData)
  }, [])

  const handleAddNew = useCallback(() => {
    const newAccrual = AccrualUtils.createEmptyAccrual()
    setAccruals(prev => [...prev, newAccrual])
  }, [])

  const handleExportAll = useCallback(() => {
    const csvContent = AccrualUtils.exportToCSV(accruals, true)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accruals_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [accruals])

  // Validate balance consistency
  const balanceValidation = accruals.map(accrual => ({
    id: accrual.id,
    ...AccrualUtils.validateBalance(accrual)
  }))
  
  const hasBalanceIssues = balanceValidation.some(v => !v.isValid)

  return (
    <DashboardLayout 
      title="Enhanced Accruals" 
      subtitle="Advanced accrued expenses management with validation and analytics"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
                size="sm"
              >
                <Table className="h-4 w-4 mr-2" />
                Spreadsheet View
              </Button>
              <Button
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                onClick={() => setViewMode('summary')}
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Summary View
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="outline"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Import CSV'}
              </Button>
              <Button 
                onClick={handleAddNew}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
              <Button 
                onClick={handleExportAll}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Balance validation alert */}
          {hasBalanceIssues && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Balance Validation Issues
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some accruals have inconsistent balances. Check the calculated vs. provided amounts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Result */}
        {showUploadResult && uploadResult && (
          <div className={`border rounded-md p-4 ${
            uploadResult.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {uploadResult.errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                )}
                <h3 className={`text-sm font-medium ${
                  uploadResult.errors.length > 0 ? 'text-red-800' : 'text-green-800'
                }`}>
                  Import {uploadResult.errors.length > 0 ? 'Completed with Issues' : 'Successful'}
                </h3>
              </div>
              <Button
                onClick={() => setShowUploadResult(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            
            <div className="mt-2 text-sm">
              <div className={uploadResult.errors.length > 0 ? 'text-red-700' : 'text-green-700'}>
                Processed {uploadResult.summary.totalRows} rows: 
                {uploadResult.summary.successfulImports} successful, 
                {uploadResult.summary.failedImports} failed, 
                {uploadResult.summary.skippedRows} skipped
              </div>
              
              {uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-red-700">{error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="text-red-700">... and {uploadResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
              
              {uploadResult.warnings.length > 0 && (
                <div className="mt-2">
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {uploadResult.warnings.slice(0, 3).map((warning, index) => (
                      <li key={index} className="text-yellow-700">{warning}</li>
                    ))}
                    {uploadResult.warnings.length > 3 && (
                      <li className="text-yellow-700">... and {uploadResult.warnings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary View */}
        {viewMode === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Balance
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {AccrualUtils.formatCurrency(summary.totalBalance, true)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Table className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Accruals
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {summary.activeAccruals}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Upload className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Vendors
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                          {summary.vendorCount}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className={`h-8 w-8 ${
                        Math.abs(summary.variance) < 0.01 ? 'text-green-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Variance
                        </dt>
                        <dd className={`text-2xl font-semibold ${
                          Math.abs(summary.variance) < 0.01 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {AccrualUtils.formatCurrency(summary.variance, true)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional summary metrics */}
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Activity Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Reversals</div>
                  <div className="text-xl font-semibold text-red-600">
                    {AccrualUtils.formatCurrency(summary.totalReversal, true)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Accruals</div>
                  <div className="text-xl font-semibold text-green-600">
                    {AccrualUtils.formatCurrency(summary.totalAccrual, true)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Monthly Activity</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {AccrualUtils.formatCurrency(summary.monthlyActivity, true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Table View */}
        {viewMode === 'table' && (
          <EnhancedAccrualsTable 
            initialData={accruals}
            onDataChange={handleDataChange}
            balanceSheetAmount={balanceSheetAmount}
            onBalanceSheetChange={setBalanceSheetAmount}
          />
        )}
      </div>
    </DashboardLayout>
  )
}