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
  FileSpreadsheet,
  Calendar,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import {
  PrepaidVendor,
  PrepaidRecord,
  MonthColumn,
  PrepaidSummary,
  EditingCell,
  PrepaidFormData,
  PrepaidFilter,
  AmortizationEntry,
  PrepaidViewMode
} from '@/types/ultimate-prepaid'

// Generate months for the current year
const generateMonths = (): MonthColumn[] => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const months: MonthColumn[] = []
  
  for (let month = 1; month <= 12; month++) {
    const key = `${month}/${currentYear.toString().slice(-2)}`
    const date = new Date(currentYear, month - 1, 1)
    
    months.push({
      key,
      month,
      year: currentYear,
      displayName: key,
      fullName: date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      isCurrentMonth: month === currentMonth,
      isPastMonth: month < currentMonth,
      isFutureMonth: month > currentMonth
    })
  }
  
  return months
}

// Sample vendors
const initialVendors: PrepaidVendor[] = [
  {
    id: '1',
    name: 'Microsoft Corporation',
    description: 'Office 365 Subscription',
    category: 'Software',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Salesforce Inc',
    description: 'CRM Platform',
    category: 'Software',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'State Farm Insurance',
    description: 'General Liability Insurance',
    category: 'Insurance',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'AWS',
    description: 'Cloud Services Prepaid',
    category: 'Technology',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'WeWork',
    description: 'Office Space Rental',
    category: 'Rent',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Sample prepaid records
const initialRecords: PrepaidRecord[] = [
  {
    id: '1',
    vendorId: '1',
    vendor: initialVendors[0],
    description: 'Office 365 Annual Subscription',
    initialAmount: 12000.00,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    termMonths: 12,
    monthlyAmortization: 1000.00,
    currentBalance: 9000.00,
    amortizationSchedule: {
      '1/25': { month: '1/25', amortization: 1000.00, remainingBalance: 11000.00, isActual: true },
      '2/25': { month: '2/25', amortization: 1000.00, remainingBalance: 10000.00, isActual: true },
      '3/25': { month: '3/25', amortization: 1000.00, remainingBalance: 9000.00, isActual: true },
      '4/25': { month: '4/25', amortization: 1000.00, remainingBalance: 8000.00, isActual: false },
      '5/25': { month: '5/25', amortization: 1000.00, remainingBalance: 7000.00, isActual: false },
      '6/25': { month: '6/25', amortization: 1000.00, remainingBalance: 6000.00, isActual: false },
      '7/25': { month: '7/25', amortization: 1000.00, remainingBalance: 5000.00, isActual: false },
      '8/25': { month: '8/25', amortization: 1000.00, remainingBalance: 4000.00, isActual: false },
      '9/25': { month: '9/25', amortization: 1000.00, remainingBalance: 3000.00, isActual: false },
      '10/25': { month: '10/25', amortization: 1000.00, remainingBalance: 2000.00, isActual: false },
      '11/25': { month: '11/25', amortization: 1000.00, remainingBalance: 1000.00, isActual: false },
      '12/25': { month: '12/25', amortization: 1000.00, remainingBalance: 0.00, isActual: false }
    },
    glAccount: '12100',
    expenseAccount: '61000',
    isActive: true,
    isFullyAmortized: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    vendorId: '2',
    vendor: initialVendors[1],
    description: 'Salesforce Annual License',
    initialAmount: 24000.00,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    termMonths: 12,
    monthlyAmortization: 2000.00,
    currentBalance: 18000.00,
    amortizationSchedule: {
      '1/25': { month: '1/25', amortization: 2000.00, remainingBalance: 22000.00, isActual: true },
      '2/25': { month: '2/25', amortization: 2000.00, remainingBalance: 20000.00, isActual: true },
      '3/25': { month: '3/25', amortization: 2000.00, remainingBalance: 18000.00, isActual: true },
      '4/25': { month: '4/25', amortization: 2000.00, remainingBalance: 16000.00, isActual: false },
      '5/25': { month: '5/25', amortization: 2000.00, remainingBalance: 14000.00, isActual: false },
      '6/25': { month: '6/25', amortization: 2000.00, remainingBalance: 12000.00, isActual: false },
      '7/25': { month: '7/25', amortization: 2000.00, remainingBalance: 10000.00, isActual: false },
      '8/25': { month: '8/25', amortization: 2000.00, remainingBalance: 8000.00, isActual: false },
      '9/25': { month: '9/25', amortization: 2000.00, remainingBalance: 6000.00, isActual: false },
      '10/25': { month: '10/25', amortization: 2000.00, remainingBalance: 4000.00, isActual: false },
      '11/25': { month: '11/25', amortization: 2000.00, remainingBalance: 2000.00, isActual: false },
      '12/25': { month: '12/25', amortization: 2000.00, remainingBalance: 0.00, isActual: false }
    },
    glAccount: '12100',
    expenseAccount: '61000',
    isActive: true,
    isFullyAmortized: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    vendorId: '3',
    vendor: initialVendors[2],
    description: 'General Liability Insurance',
    initialAmount: 6000.00,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    termMonths: 12,
    monthlyAmortization: 500.00,
    currentBalance: 4500.00,
    amortizationSchedule: {
      '1/25': { month: '1/25', amortization: 500.00, remainingBalance: 5500.00, isActual: true },
      '2/25': { month: '2/25', amortization: 500.00, remainingBalance: 5000.00, isActual: true },
      '3/25': { month: '3/25', amortization: 500.00, remainingBalance: 4500.00, isActual: true },
      '4/25': { month: '4/25', amortization: 500.00, remainingBalance: 4000.00, isActual: false },
      '5/25': { month: '5/25', amortization: 500.00, remainingBalance: 3500.00, isActual: false },
      '6/25': { month: '6/25', amortization: 500.00, remainingBalance: 3000.00, isActual: false },
      '7/25': { month: '7/25', amortization: 500.00, remainingBalance: 2500.00, isActual: false },
      '8/25': { month: '8/25', amortization: 500.00, remainingBalance: 2000.00, isActual: false },
      '9/25': { month: '9/25', amortization: 500.00, remainingBalance: 1500.00, isActual: false },
      '10/25': { month: '10/25', amortization: 500.00, remainingBalance: 1000.00, isActual: false },
      '11/25': { month: '11/25', amortization: 500.00, remainingBalance: 500.00, isActual: false },
      '12/25': { month: '12/25', amortization: 500.00, remainingBalance: 0.00, isActual: false }
    },
    glAccount: '12200',
    expenseAccount: '62000',
    isActive: true,
    isFullyAmortized: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

interface UltimatePrepaidTrackerProps {
  className?: string
  initialData?: PrepaidRecord[]
  onDataChange?: (data: PrepaidRecord[]) => void
  loading?: boolean
}

export function UltimatePrepaidTracker({ 
  className, 
  initialData, 
  onDataChange, 
  loading = false 
}: UltimatePrepaidTrackerProps) {
  // State management
  const [vendors, setVendors] = useState<PrepaidVendor[]>(initialVendors)
  const [records, setRecords] = useState<PrepaidRecord[]>(initialRecords)
  const [months] = useState<MonthColumn[]>(generateMonths())
  const [balanceSheetAmount, setBalanceSheetAmount] = useState<number>(31500)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [viewMode, setViewMode] = useState<PrepaidViewMode>('spreadsheet')
  const [showAddPrepaid, setShowAddPrepaid] = useState(false)
  const [newPrepaidForm, setNewPrepaidForm] = useState<PrepaidFormData>({
    vendorName: '',
    description: '',
    category: '',
    initialAmount: 0,
    startDate: new Date(),
    termMonths: 12,
    glAccount: '12100',
    expenseAccount: '61000'
  })
  const [filterOptions, setFilterOptions] = useState<PrepaidFilter>({
    searchTerm: '',
    showInactive: false,
    showFullyAmortized: false
  })
  
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate summary statistics
  const summary = useMemo((): PrepaidSummary => {
    const monthlyAmortizationTotals: Record<string, number> = {}
    let totalInitialAmount = 0
    let totalCurrentBalance = 0
    let totalAmortizedToDate = 0
    let totalMonthlyAmortization = 0
    let fullyAmortizedCount = 0
    
    // Initialize monthly totals
    months.forEach(month => {
      monthlyAmortizationTotals[month.key] = 0
    })
    
    // Calculate totals
    const activeRecords = filterOptions.showInactive ? records : records.filter(r => r.isActive)
    const filteredRecords = filterOptions.showFullyAmortized ? activeRecords : activeRecords.filter(r => !r.isFullyAmortized)
    
    filteredRecords.forEach(record => {
      totalInitialAmount += record.initialAmount
      totalCurrentBalance += record.currentBalance
      totalAmortizedToDate += (record.initialAmount - record.currentBalance)
      totalMonthlyAmortization += record.monthlyAmortization
      
      if (record.isFullyAmortized) fullyAmortizedCount++
      
      Object.entries(record.amortizationSchedule).forEach(([monthKey, entry]) => {
        if (monthlyAmortizationTotals[monthKey] !== undefined) {
          monthlyAmortizationTotals[monthKey] += entry.amortization
        }
      })
    })
    
    // Find upcoming expirations (next 3 months)
    const currentDate = new Date()
    const threeMonthsFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, currentDate.getDate())
    const upcomingExpirations = filteredRecords.filter(record => 
      record.endDate <= threeMonthsFromNow && record.endDate >= currentDate
    )
    
    const averageTermMonths = filteredRecords.length > 0 
      ? filteredRecords.reduce((sum, record) => sum + record.termMonths, 0) / filteredRecords.length 
      : 0
    
    return {
      totalInitialAmount,
      totalCurrentBalance,
      totalAmortizedToDate,
      totalMonthlyAmortization,
      monthlyAmortizationTotals,
      vendorCount: vendors.length,
      activeVendorCount: vendors.filter(v => v.isActive).length,
      fullyAmortizedCount,
      averageTermMonths,
      upcomingExpirations
    }
  }, [records, vendors, months, filterOptions])

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!filterOptions.showInactive && !record.isActive) return false
      if (!filterOptions.showFullyAmortized && record.isFullyAmortized) return false
      
      if (filterOptions.searchTerm) {
        const searchLower = filterOptions.searchTerm.toLowerCase()
        if (!record.vendor.name.toLowerCase().includes(searchLower) &&
            !record.description.toLowerCase().includes(searchLower) &&
            !record.vendor.category?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      if (filterOptions.category && record.vendor.category !== filterOptions.category) {
        return false
      }
      
      if (filterOptions.minBalance !== undefined && record.currentBalance < filterOptions.minBalance) {
        return false
      }
      
      if (filterOptions.maxBalance !== undefined && record.currentBalance > filterOptions.maxBalance) {
        return false
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
    }).format(amount)
  }, [])

  // Parse number from string
  const parseNumber = useCallback((value: string): number => {
    if (!value || value.trim() === '') return 0
    const cleaned = value.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }, [])

  // Handle cell editing
  const handleCellClick = useCallback((recordId: string, monthKey: string) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return
    
    const entry = record.amortizationSchedule[monthKey]
    const currentValue = entry ? entry.amortization : 0
    
    setEditingCell({ recordId, monthKey, field: 'amortization', value: currentValue.toString() })
    setEditValue(formatCurrency(currentValue, true))
  }, [records, formatCurrency])

  const handleCellSave = useCallback(() => {
    if (!editingCell) return
    
    const newValue = parseNumber(editValue)
    
    setRecords(prev => prev.map(record => {
      if (record.id !== editingCell.recordId) return record
      
      const updatedSchedule = { ...record.amortizationSchedule }
      const currentEntry = updatedSchedule[editingCell.monthKey]
      
      if (currentEntry) {
        updatedSchedule[editingCell.monthKey] = {
          ...currentEntry,
          amortization: newValue,
          isActual: true
        }
        
        // Recalculate remaining balances
        let runningBalance = record.initialAmount
        const sortedEntries = Object.entries(updatedSchedule).sort(([a], [b]) => {
          const [monthA, yearA] = a.split('/')
          const [monthB, yearB] = b.split('/')
          return parseInt(yearA) - parseInt(yearB) || parseInt(monthA) - parseInt(monthB)
        })
        
        sortedEntries.forEach(([monthKey, entry]) => {
          runningBalance -= entry.amortization
          updatedSchedule[monthKey] = {
            ...entry,
            remainingBalance: Math.max(0, runningBalance)
          }
        })
        
        // Update current balance and monthly amortization
        const currentBalance = Math.max(0, runningBalance)
        const totalAmortized = record.initialAmount - currentBalance
        const monthsElapsed = Object.values(updatedSchedule).filter(e => e.isActual).length
        const newMonthlyAmortization = monthsElapsed > 0 ? totalAmortized / monthsElapsed : record.monthlyAmortization
        
        return {
          ...record,
          amortizationSchedule: updatedSchedule,
          currentBalance,
          monthlyAmortization: newMonthlyAmortization,
          isFullyAmortized: currentBalance <= 0.01,
          updatedAt: new Date()
        }
      }
      
      return record
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

  // Add new prepaid
  const handleAddPrepaid = useCallback(() => {
    if (!newPrepaidForm.vendorName.trim() || !newPrepaidForm.description.trim() || newPrepaidForm.initialAmount <= 0) {
      return
    }
    
    // Find or create vendor
    let vendor = vendors.find(v => v.name.toLowerCase() === newPrepaidForm.vendorName.toLowerCase())
    if (!vendor) {
      vendor = {
        id: Date.now().toString(),
        name: newPrepaidForm.vendorName.trim(),
        description: newPrepaidForm.description,
        category: newPrepaidForm.category,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setVendors(prev => [...prev, vendor!])
    }
    
    // Calculate amortization schedule
    const monthlyAmortization = newPrepaidForm.initialAmount / newPrepaidForm.termMonths
    const amortizationSchedule: Record<string, AmortizationEntry> = {}
    
    let runningBalance = newPrepaidForm.initialAmount
    const startDate = new Date(newPrepaidForm.startDate)
    
    for (let i = 0; i < newPrepaidForm.termMonths; i++) {
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
      const monthKey = `${currentDate.getMonth() + 1}/${currentDate.getFullYear().toString().slice(-2)}`
      
      runningBalance -= monthlyAmortization
      amortizationSchedule[monthKey] = {
        month: monthKey,
        amortization: monthlyAmortization,
        remainingBalance: Math.max(0, runningBalance),
        isActual: false
      }
    }
    
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + newPrepaidForm.termMonths, 0)
    
    const newRecord: PrepaidRecord = {
      id: Date.now().toString(),
      vendorId: vendor.id,
      vendor,
      description: newPrepaidForm.description,
      initialAmount: newPrepaidForm.initialAmount,
      startDate: newPrepaidForm.startDate,
      endDate,
      termMonths: newPrepaidForm.termMonths,
      monthlyAmortization,
      currentBalance: newPrepaidForm.initialAmount,
      amortizationSchedule,
      glAccount: newPrepaidForm.glAccount,
      expenseAccount: newPrepaidForm.expenseAccount,
      isActive: true,
      isFullyAmortized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: newPrepaidForm.notes
    }
    
    setRecords(prev => [...prev, newRecord])
    setNewPrepaidForm({
      vendorName: '',
      description: '',
      category: '',
      initialAmount: 0,
      startDate: new Date(),
      termMonths: 12,
      glAccount: '12100',
      expenseAccount: '61000'
    })
    setShowAddPrepaid(false)
  }, [newPrepaidForm, vendors])

  // Export to CSV
  const handleExport = useCallback(() => {
    const headers = [
      'Vendor',
      'Description',
      'Category',
      'Initial Amount',
      'Current Balance',
      'Start Date',
      'End Date',
      'Term (Months)',
      'Monthly Amortization',
      'GL Account',
      'Expense Account',
      ...months.map(month => `${month.displayName} Amortization`),
      'Status'
    ]
    
    const rows = filteredRecords.map(record => {
      const row = [
        record.vendor.name,
        record.description,
        record.vendor.category || '',
        record.initialAmount.toString(),
        record.currentBalance.toString(),
        record.startDate.toISOString().split('T')[0],
        record.endDate.toISOString().split('T')[0],
        record.termMonths.toString(),
        record.monthlyAmortization.toString(),
        record.glAccount,
        record.expenseAccount
      ]
      
      months.forEach(month => {
        const entry = record.amortizationSchedule[month.key]
        row.push(entry ? entry.amortization.toString() : '0')
      })
      
      row.push(record.isFullyAmortized ? 'Fully Amortized' : 'Active')
      return row
    })
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prepaids_${new Date().toISOString().split('T')[0]}.csv`
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

  const variance = summary.totalCurrentBalance - balanceSheetAmount
  const categories = [...new Set(vendors.map(v => v.category).filter(Boolean))]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prepaids</h1>
            <p className="text-gray-600">Manage prepaid expenses and amortization schedules</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search prepaids..."
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
              Amortization Schedule
            </Button>
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              onClick={() => setViewMode('summary')}
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary View
            </Button>
            <Button
              variant={viewMode === 'reconciliation' ? 'default' : 'outline'}
              onClick={() => setViewMode('reconciliation')}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reconciliation
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
              onClick={() => setShowAddPrepaid(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prepaid
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

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={filterOptions.category || ''}
            onChange={(e) => setFilterOptions(prev => ({ ...prev, category: e.target.value || undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filterOptions.showFullyAmortized}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, showFullyAmortized: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show Fully Amortized</span>
          </label>
          
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filterOptions.showInactive}
              onChange={(e) => setFilterOptions(prev => ({ ...prev, showInactive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Show Inactive</span>
          </label>
        </div>
      </div>

      {/* Add Prepaid Modal */}
      {showAddPrepaid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Prepaid</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={newPrepaidForm.vendorName}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, vendorName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newPrepaidForm.category}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Software">Software</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Rent">Rent</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newPrepaidForm.description}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Amount *
                </label>
                <input
                  type="number"
                  value={newPrepaidForm.initialAmount || ''}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, initialAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term (Months) *
                </label>
                <input
                  type="number"
                  value={newPrepaidForm.termMonths}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, termMonths: parseInt(e.target.value) || 12 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={newPrepaidForm.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Amortization
                </label>
                <input
                  type="text"
                  value={formatCurrency(newPrepaidForm.initialAmount / newPrepaidForm.termMonths, true)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GL Account
                </label>
                <input
                  type="text"
                  value={newPrepaidForm.glAccount}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, glAccount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Account
                </label>
                <input
                  type="text"
                  value={newPrepaidForm.expenseAccount}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, expenseAccount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="61000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newPrepaidForm.notes || ''}
                  onChange={(e) => setNewPrepaidForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => {
                  setShowAddPrepaid(false)
                  setNewPrepaidForm({
                    vendorName: '',
                    description: '',
                    category: '',
                    initialAmount: 0,
                    startDate: new Date(),
                    termMonths: 12,
                    glAccount: '12100',
                    expenseAccount: '61000'
                  })
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPrepaid}
                disabled={!newPrepaidForm.vendorName.trim() || !newPrepaidForm.description.trim() || newPrepaidForm.initialAmount <= 0}
              >
                Add Prepaid
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet and Variance */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Prepaid Assets - Balance Sheet Reconciliation</h2>
          
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
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Current Balance:</label>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                ${formatCurrency(summary.totalCurrentBalance, true)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts for upcoming expirations */}
      {summary.upcomingExpirations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Upcoming Expirations ({summary.upcomingExpirations.length})
              </h3>
              <div className="text-sm text-yellow-700 mt-1">
                {summary.upcomingExpirations.map(record => (
                  <div key={record.id}>
                    {record.vendor.name} - {record.description} expires {record.endDate.toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Initial Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.totalInitialAmount, true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.totalCurrentBalance, true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Amortized to Date</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.totalAmortizedToDate, true)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Amortization</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${formatCurrency(summary.totalMonthlyAmortization, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation View */}
      {viewMode === 'reconciliation' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Sheet Reconciliation</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
              <div>Account</div>
              <div>Prepaid Balance</div>
              <div>GL Balance</div>
              <div>Variance</div>
            </div>
            
            {/* Group by GL Account */}
            {Object.entries(
              filteredRecords.reduce((acc, record) => {
                if (!acc[record.glAccount]) {
                  acc[record.glAccount] = { balance: 0, records: [] }
                }
                acc[record.glAccount].balance += record.currentBalance
                acc[record.glAccount].records.push(record)
                return acc
              }, {} as Record<string, { balance: number; records: PrepaidRecord[] }>)
            ).map(([account, data]) => {
              const glBalance = account === '12100' ? balanceSheetAmount * 0.7 : balanceSheetAmount * 0.3 // Mock GL balances
              const variance = data.balance - glBalance
              
              return (
                <div key={account} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                  <div className="font-medium">{account}</div>
                  <div>${formatCurrency(data.balance, true)}</div>
                  <div>${formatCurrency(glBalance, true)}</div>
                  <div className={`font-medium ${
                    Math.abs(variance) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${formatCurrency(variance, true)}
                  </div>
                </div>
              )
            })}
            
            <div className="grid grid-cols-4 gap-4 text-sm font-bold pt-2 border-t">
              <div>TOTAL</div>
              <div>${formatCurrency(summary.totalCurrentBalance, true)}</div>
              <div>${formatCurrency(balanceSheetAmount, true)}</div>
              <div className={`${
                Math.abs(variance) < 0.01 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${formatCurrency(variance, true)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amortization Schedule View */}
      {viewMode === 'spreadsheet' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[250px]">
                    Prepaid Details
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                    Initial Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                    Current Balance
                  </th>
                  {months.map(month => (
                    <th key={month.key} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[100px]">
                      <div className="mb-1">{month.displayName}</div>
                      <div className="text-xs text-blue-600">Amortization</div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, recordIndex) => (
                  <tr key={record.id} className={recordIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Prepaid Details */}
                    <td className="sticky left-0 bg-inherit px-4 py-3 border-r border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.vendor.name}</div>
                        <div className="text-xs text-gray-500">{record.description}</div>
                        <div className="text-xs text-gray-400">
                          {record.vendor.category} | {record.startDate.toLocaleDateString()} - {record.endDate.toLocaleDateString()}
                        </div>
                        {record.isFullyAmortized && (
                          <div className="text-xs text-green-600 font-medium">Fully Amortized</div>
                        )}
                      </div>
                    </td>
                    
                    {/* Initial Amount */}
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 border-r border-gray-200">
                      ${formatCurrency(record.initialAmount, true)}
                    </td>
                    
                    {/* Current Balance */}
                    <td className="px-4 py-3 text-sm text-center font-medium border-r border-gray-200">
                      <span className={record.currentBalance <= 0.01 ? 'text-green-600' : 'text-gray-900'}>
                        ${formatCurrency(record.currentBalance, true)}
                      </span>
                    </td>
                    
                    {/* Monthly Amortization Columns */}
                    {months.map(month => {
                      const entry = record.amortizationSchedule[month.key]
                      const isEditing = editingCell?.recordId === record.id && 
                                       editingCell?.monthKey === month.key
                      const hasValue = entry && entry.amortization > 0
                      const isPastMonth = month.isPastMonth
                      const isCurrentMonth = month.isCurrentMonth
                      
                      return (
                        <td key={month.key} className="border-r border-gray-200 p-0">
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              onKeyDown={handleKeyDown}
                              className="w-full h-full px-2 py-3 text-sm text-center border-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            />
                          ) : (
                            <div
                              onClick={() => handleCellClick(record.id, month.key)}
                              className={`w-full h-full px-2 py-3 text-sm text-center cursor-pointer hover:bg-gray-100 flex items-center justify-center min-h-[48px] ${
                                hasValue ? (entry?.isActual ? 'text-blue-600 font-medium' : 'text-gray-600') : ''
                              } ${
                                isPastMonth ? 'bg-gray-50' : isCurrentMonth ? 'bg-yellow-50' : ''
                              }`}
                            >
                              {hasValue ? formatCurrency(entry.amortization) : ''}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                
                {/* Totals Row */}
                <tr className="bg-gray-100 border-t-2 border-gray-400 font-semibold">
                  <td className="sticky left-0 bg-gray-100 px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200">
                    TOTALS
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900 border-r border-gray-200">
                    ${formatCurrency(summary.totalInitialAmount, true)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900 border-r border-gray-200">
                    ${formatCurrency(summary.totalCurrentBalance, true)}
                  </td>
                  {months.map(month => {
                    const monthTotal = summary.monthlyAmortizationTotals[month.key] || 0
                    return (
                      <td key={month.key} className="border-r border-gray-200 px-2 py-3 text-sm text-center font-bold text-blue-600">
                        {monthTotal > 0 ? formatCurrency(monthTotal) : ''}
                      </td>
                    )
                  })}
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
          <li>• Click any amortization cell to edit actual amounts</li>
          <li>• Press Enter to save, Escape to cancel</li>
          <li>• Use &quot;Add Prepaid&quot; to create new prepaid entries</li>
          <li>• Current balance is automatically calculated from amortization</li>
          <li>• Blue values are actual, gray values are projected</li>
          <li>• Use Reconciliation view to match with balance sheet</li>
        </ul>
      </div>
    </div>
  )
}