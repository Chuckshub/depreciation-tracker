"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Upload, BarChart3, Table } from "lucide-react"
import { useState, useRef } from "react"
import { Accrual } from "@/types/accrual"
import { AccrualsCSVParser } from "@/lib/accruals-csv-parser"
import { EditableAccrualsTable } from "@/components/accruals/editable-accruals-table"

// Sample data based on the provided CSV
const sampleAccruals: Accrual[] = [
  {
    id: '1',
    vendor: 'The Pipeline Group',
    description: 'Sales',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 40500.00,
    monthlyEntries: {
      '6/25': { reversal: -40500.00, accrual: 40500.00 }
    }
  },
  {
    id: '2',
    vendor: 'Pann Communication',
    description: 'Marketing',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 17245.00,
    monthlyEntries: {
      '6/25': { reversal: -17245.00, accrual: 17245.00 }
    }
  },
  {
    id: '3',
    vendor: 'Linkedin',
    description: 'Demand Gen',
    accrualJEAccountDR: '66070',
    accrualJEAccountCR: '20005',
    balance: 52925.05,
    monthlyEntries: {
      '6/25': { reversal: -31319.87, accrual: 52925.05 }
    }
  },
  {
    id: '4',
    vendor: 'DoIt',
    description: 'Cloud Costs',
    accrualJEAccountDR: '66070',
    accrualJEAccountCR: '20005',
    balance: 14765.91,
    monthlyEntries: {
      '6/25': { reversal: -18000.00, accrual: 14765.91 }
    }
  },
  {
    id: '5',
    vendor: 'Together Holdings',
    description: 'Marketing',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 24598.17,
    monthlyEntries: {
      '7/25': { reversal: 0, accrual: 24598.17 }
    }
  },
  {
    id: '6',
    vendor: 'DV Research',
    description: 'Marketing',
    accrualJEAccountDR: '67250',
    accrualJEAccountCR: '20005',
    balance: 10000.00,
    monthlyEntries: {
      '7/25': { reversal: 0, accrual: 10000.00 }
    }
  },
  {
    id: '7',
    vendor: 'Sandra Kennedy',
    description: 'Demand Gen',
    accrualJEAccountDR: '64061',
    accrualJEAccountCR: '20005',
    balance: 2437.50,
    monthlyEntries: {
      '7/25': { reversal: 0, accrual: 2437.50 }
    }
  }
]

export default function AccrualsPage() {
  const [accruals, setAccruals] = useState<Accrual[]>(sampleAccruals)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'summary'>('table')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadErrors([])

    try {
      const text = await file.text()
      const { accruals: parsedAccruals, errors } = AccrualsCSVParser.parseCSVToAccruals(text)
      
      if (errors.length > 0) {
        setUploadErrors(errors)
      }
      
      if (parsedAccruals.length > 0) {
        setAccruals(parsedAccruals)
        console.log(`Successfully imported ${parsedAccruals.length} accruals`)
      }
    } catch (error) {
      setUploadErrors([`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDataChange = (newData: Accrual[]) => {
    setAccruals(newData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateSummary = () => {
    const totalBalance = accruals.reduce((sum, accrual) => sum + accrual.balance, 0)
    const activeAccruals = accruals.filter(a => a.balance > 0).length
    const vendorCount = new Set(accruals.map(a => a.vendor)).size

    return {
      totalBalance,
      activeAccruals,
      vendorCount
    }
  }

  const summary = calculateSummary()

  return (
    <DashboardLayout title="Accruals" subtitle="Manage accrued expenses with spreadsheet-like editing">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
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
          </div>
        </div>

        {/* Upload Errors */}
        {uploadErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">Upload Errors:</h3>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {uploadErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary View */}
        {viewMode === 'summary' && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                        {formatCurrency(summary.totalBalance)}
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
          </div>
        )}

        {/* Editable Table View */}
        {viewMode === 'table' && (
          <EditableAccrualsTable 
            initialData={accruals}
            onDataChange={handleDataChange}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
