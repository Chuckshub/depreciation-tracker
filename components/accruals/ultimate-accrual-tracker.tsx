"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Upload, 
  Download, 
  Search, 
  BarChart3, 
  Table, 
  Calculator,
  FileSpreadsheet
} from 'lucide-react'
import {
  AccrualVendor,
  AccrualRecord,
  MonthColumn,
  EditingCell,
  FilterOptions,
  AccrualSummary
} from '@/types/ultimate-accrual'
import { Accrual } from '@/types/accrual'

// Generate months for the current year
const generateMonths = (): MonthColumn[] => {
  const currentYear = new Date().getFullYear()
  const months: MonthColumn[] = []
  
  for (let month = 1; month <= 12; month++) {
    const key = `${month}/${currentYear.toString().slice(-2)}`
    months.push({
      key,
      month,
      year: currentYear,
      displayName: key,
      fullName: new Date(currentYear, month - 1).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    })
  }
  
  return months
}

// Sample data
const initialVendors: AccrualVendor[] = [
  {
    id: '1',
    name: 'The Pipeline Group',
    description: 'Sales Commission',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2', 
    name: 'Pann Communication',
    description: 'Marketing Services',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'LinkedIn Corporation', 
    description: 'Demand Generation',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'DoIt Cloud Services',
    description: 'Infrastructure',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Together Holdings',
    description: 'Marketing Consulting',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: 'DV Research',
    description: 'Market Research',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    name: 'Sandra Kennedy',
    description: 'Consulting',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const initialRecords: AccrualRecord[] = [
  {
    id: '1',
    vendorId: '1',
    vendor: initialVendors[0],
    monthlyEntries: {
      '4/25': { reversal: -40500.00, accrual: 40500.00 },
      '7/25': { reversal: 0, accrual: 17245.00 }
    },
    balance: 40500.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    vendorId: '2', 
    vendor: initialVendors[1],
    monthlyEntries: {
      '4/25': { reversal: -17245.00, accrual: 17245.00 },
      '7/25': { reversal: 0, accrual: 17245.00 }
    },
    balance: 17245.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    vendorId: '3',
    vendor: initialVendors[2],
    monthlyEntries: {
      '4/25': { reversal: -31319.87, accrual: 52925.05 },
      '7/25': { reversal: 0, accrual: 52925.05 }
    },
    balance: 52925.05,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    vendorId: '4',
    vendor: initialVendors[3],
    monthlyEntries: {
      '4/25': { reversal: -18000.00, accrual: 14765.91 },
      '7/25': { reversal: 0, accrual: 14765.91 }
    },
    balance: 14765.91,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    vendorId: '5',
    vendor: initialVendors[4],
    monthlyEntries: {
      '7/25': { reversal: -24598.17, accrual: 24598.17 }
    },
    balance: 24598.17,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    vendorId: '6',
    vendor: initialVendors[5],
    monthlyEntries: {
      '7/25': { reversal: -10000.00, accrual: 10000.00 }
    },
    balance: 10000.00,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    vendorId: '7',
    vendor: initialVendors[6],
    monthlyEntries: {
      '7/25': { reversal: -2437.50, accrual: 2437.50 }
    },
    balance: 2437.50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

interface UltimateAccrualTrackerProps {
  className?: string
  initialData?: Accrual[]
  onDataChange?: (data: Accrual[]) => void
  loading?: boolean
}

export function UltimateAccrualTracker({ 
  className, 
  initialData, 
  onDataChange, 
  loading = false 
}: UltimateAccrualTrackerProps) {
  // State management
  const [vendors, setVendors] = useState<AccrualVendor[]>(initialVendors)
  const [records, setRecords] = useState<AccrualRecord[]>(initialRecords)
  const [months] = useState<MonthColumn[]>(generateMonths())
  const [balanceSheetAmount, setBalanceSheetAmount] = useState<number>(0)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'summary'>('spreadsheet')
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [newVendorDescription, setNewVendorDescription] = useState('')
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    showInactive: false,
    hasActivity: null
  })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate summary statistics
  const summary = useMemo((): AccrualSummary => {
    const monthlyTotals: Record<string, { reversals: number; accruals: number }> = {}
    let totalReversals = 0
    let totalAccruals = 0
    
    // Initialize monthly totals
    months.forEach(month => {
      monthlyTotals[month.key] = { reversals: 0, accruals: 0 }
    })
    
    // Calculate totals
    records.forEach(record => {
      if (!record.isActive && !filterOptions.showInactive) return
      
      Object.entries(record.monthlyEntries).forEach(([monthKey, entry]) => {
        if (monthlyTotals[monthKey]) {
          monthlyTotals[monthKey].reversals += entry.reversal
          monthlyTotals[monthKey].accruals += entry.accrual
        }
        totalReversals += entry.reversal
        totalAccruals += entry.accrual
      })
    })
    
    const netBalance = totalAccruals + totalReversals // reversals are negative
    
    return {
      totalReversals,
      totalAccruals,
      netBalance,
      monthlyTotals,
      vendorCount: vendors.length,
      activeVendorCount: vendors.filter(v => v.isActive).length
    }
  }, [records, vendors, months, filterOptions.showInactive])

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!filterOptions.showInactive && !record.isActive) return false
      
      if (filterOptions.searchTerm) {
        const searchLower = filterOptions.searchTerm.toLowerCase()
        if (!record.vendor.name.toLowerCase().includes(searchLower) &&
            !record.vendor.description?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      if (filterOptions.hasActivity !== null) {
        const hasActivity = Object.values(record.monthlyEntries).some(entry => 
          entry.accrual !== 0 || entry.reversal !== 0
        )
        if (hasActivity !== filterOptions.hasActivity) return false
      }
      
      return true
    })
  }, [records, filterOptions])

  // Format currency
  const formatCurrency = useCallback((amount: number, showZero = false): string => {
    if (amount === 0 && !showZero) return ''
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount))
  }, [])

  // Parse number from string
  const parseNumber = useCallback((value: string): number => {
    if (!value || value.trim() === '') return 0
    const cleaned = value.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }, [])

  // Handle cell editing
  const handleCellClick = useCallback((recordId: string, monthKey: string, field: 'reversal' | 'accrual') => {
    const record = records.find(r => r.id === recordId)
    if (!record) return
    
    const entry = record.monthlyEntries[monthKey]
    const currentValue = entry ? entry[field] : 0
    
    setEditingCell({ recordId, monthKey, field, value: currentValue.toString() })
    setEditValue(formatCurrency(currentValue, true))
  }, [records, formatCurrency])

  const handleCellSave = useCallback(() => {
    if (!editingCell) return
    
    const newValue = parseNumber(editValue)
    
    setRecords(prev => prev.map(record => {
      if (record.id !== editingCell.recordId) return record
      
      const updatedEntries = { ...record.monthlyEntries }
      const currentEntry = updatedEntries[editingCell.monthKey] || { reversal: 0, accrual: 0 }
      
      updatedEntries[editingCell.monthKey] = {
        ...currentEntry,
        [editingCell.field]: newValue
      }
      
      // Recalculate balance
      const newBalance = Object.values(updatedEntries).reduce((sum, entry) => 
        sum + entry.accrual + entry.reversal, 0
      )
      
      return {
        ...record,
        monthlyEntries: updatedEntries,
        balance: newBalance,
        updatedAt: new Date()
      }
    }))
    
    setEditingCell(null)
    setEditValue('')
  }, [editingCell, editValue, parseNumber])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditValue('')
    }
  }, [handleCellSave])

  // Add new vendor
  const handleAddVendor = useCallback(() => {
    if (!newVendorName.trim()) return
    
    const newVendor: AccrualVendor = {
      id: Date.now().toString(),
      name: newVendorName.trim(),
      description: newVendorDescription.trim() || undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const newRecord: AccrualRecord = {
      id: Date.now().toString(),
      vendorId: newVendor.id,
      vendor: newVendor,
      monthlyEntries: {},
      balance: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setVendors(prev => [...prev, newVendor])
    setRecords(prev => [...prev, newRecord])
    setNewVendorName('')
    setNewVendorDescription('')
    setShowAddVendor(false)
  }, [newVendorName, newVendorDescription])

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      'Vendor',
      'Description',
      ...months.flatMap(month => [`${month.displayName} Reversal`, `${month.displayName} Accrual`]),
      'Balance'
    ]
    
    const rows = filteredRecords.map(record => {
      const row = [
        record.vendor.name,
        record.vendor.description || ''
      ]
      
      months.forEach(month => {
        const entry = record.monthlyEntries[month.key] || { reversal: 0, accrual: 0 }
        row.push(entry.reversal.toString(), entry.accrual.toString())
      })
      
      row.push(record.balance.toString())
      return row
    })
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accruals_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredRecords, months])

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const variance = summary.netBalance - balanceSheetAmount

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accruals</h1>
            <p className="text-gray-600">Manage accrued expenses with spreadsheet-like editing</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={filterOptions.searchTerm}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* View Toggle and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'spreadsheet' ? 'default' : 'outline'}
              onClick={() => setViewMode('spreadsheet')}
              size="sm"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
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
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={() => setShowAddVendor(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter vendor name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newVendorDescription}
                  onChange={(e) => setNewVendorDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => {
                  setShowAddVendor(false)
                  setNewVendorName('')
                  setNewVendorDescription('')
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddVendor}
                disabled={!newVendorName.trim()}
              >
                Add Vendor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet and Variance */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">20005 - Accrued Expenses</h2>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Balance Sheet:</label>
              <input
                type="number"
                value={balanceSheetAmount}
                onChange={(e) => setBalanceSheetAmount(parseFloat(e.target.value) || 0)}
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Variance:</label>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                Math.abs(variance) < 0.01 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formatCurrency(variance, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Accruals</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.totalAccruals, true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reversals</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(Math.abs(summary.totalReversals), true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Net Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.netBalance, true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Table className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.activeVendorCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet View */}
      {viewMode === 'spreadsheet' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                    Vendor
                  </th>
                  {months.map(month => (
                    <th key={month.key} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      <div className="mb-1">{month.displayName}</div>
                      <div className="flex">
                        <div className="flex-1 text-xs text-red-600 border-r border-gray-200 pr-1">Reversal</div>
                        <div className="flex-1 text-xs text-green-600 pl-1">Accrual</div>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Balance
                  </th>
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, recordIndex) => (
                  <tr key={record.id} className={recordIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Vendor Name */}
                    <td className="sticky left-0 bg-inherit px-4 py-3 border-r border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.vendor.name}</div>
                        {record.vendor.description && (
                          <div className="text-xs text-gray-500">{record.vendor.description}</div>
                        )}
                      </div>
                    </td>
                    
                    {/* Monthly Columns */}
                    {months.map(month => {
                      const entry = record.monthlyEntries[month.key] || { reversal: 0, accrual: 0 }
                      const isEditingReversal = editingCell?.recordId === record.id && 
                                               editingCell?.monthKey === month.key && 
                                               editingCell?.field === 'reversal'
                      const isEditingAccrual = editingCell?.recordId === record.id && 
                                              editingCell?.monthKey === month.key && 
                                              editingCell?.field === 'accrual'
                      
                      return (
                        <td key={month.key} className="border-r border-gray-200 p-0">
                          <div className="flex h-full">
                            {/* Reversal */}
                            <div className="flex-1 border-r border-gray-200">
                              {isEditingReversal ? (
                                <input
                                  ref={inputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleCellSave}
                                  onKeyDown={handleKeyDown}
                                  className="w-full h-full px-2 py-2 text-sm text-center border-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                />
                              ) : (
                                <div
                                  onClick={() => handleCellClick(record.id, month.key, 'reversal')}
                                  className="w-full h-full px-2 py-2 text-sm text-center cursor-pointer hover:bg-gray-100 flex items-center justify-center min-h-[40px]"
                                >
                                  <span className={entry.reversal < 0 ? 'text-red-600' : ''}>
                                    {formatCurrency(entry.reversal)}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Accrual */}
                            <div className="flex-1">
                              {isEditingAccrual ? (
                                <input
                                  ref={inputRef}
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleCellSave}
                                  onKeyDown={handleKeyDown}
                                  className="w-full h-full px-2 py-2 text-sm text-center border-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                />
                              ) : (
                                <div
                                  onClick={() => handleCellClick(record.id, month.key, 'accrual')}
                                  className="w-full h-full px-2 py-2 text-sm text-center cursor-pointer hover:bg-gray-100 flex items-center justify-center min-h-[40px]"
                                >
                                  <span className={entry.accrual > 0 ? 'text-green-600' : ''}>
                                    {formatCurrency(entry.accrual)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                    
                    {/* Balance */}
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900">
                      ${formatCurrency(record.balance, true)}
                    </td>
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="bg-gray-100 border-t-2 border-gray-400 font-semibold">
                  <td className="sticky left-0 bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200">
                    TOTALS
                  </td>
                  {months.map(month => {
                    const monthTotal = summary.monthlyTotals[month.key] || { reversals: 0, accruals: 0 }
                    return (
                      <td key={month.key} className="border-r border-gray-200 p-0">
                        <div className="flex h-full">
                          <div className="flex-1 border-r border-gray-200 px-2 py-3 text-sm text-center font-bold text-red-600">
                            {formatCurrency(Math.abs(monthTotal.reversals))}
                          </div>
                          <div className="flex-1 px-2 py-3 text-sm text-center font-bold text-green-600">
                            {formatCurrency(monthTotal.accruals)}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                    ${formatCurrency(summary.netBalance, true)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">How to use:</p>
        <ul className="space-y-1 text-xs">
          <li>• Click any cell to edit reversal or accrual amounts</li>
          <li>• Press Enter to save, Escape to cancel</li>
          <li>• Use &quot;Add Vendor&quot; to create new accrual entries</li>
          <li>• Balance is automatically calculated from monthly entries</li>
          <li>• Export to CSV for external analysis</li>
        </ul>
      </div>
    </div>
  )
}