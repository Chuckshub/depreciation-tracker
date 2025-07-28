"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { Accrual } from "@/types/accrual"

interface EditableAccrualsTableProps {
  initialData?: Accrual[]
  onDataChange?: (data: Accrual[]) => void
}

interface EditingCell {
  rowId: string
  field: string
  monthKey?: string
  type?: 'reversal' | 'accrual'
}

// Generate month columns for the current year
const generateMonthColumns = () => {
  const months = []
  const currentYear = new Date().getFullYear()
  
  for (let month = 1; month <= 12; month++) {
    const date = new Date(currentYear, month - 1, 1)
    const monthKey = `${month}/${currentYear.toString().slice(-2)}`
    const displayMonth = date.toLocaleDateString('en-US', { month: 'short' })
    
    months.push({
      key: monthKey,
      display: `${month}/${currentYear.toString().slice(-2)}`,
      shortDisplay: displayMonth,
      monthName: displayMonth
    })
  }
  
  return months
}

const MONTH_COLUMNS = generateMonthColumns()

export function EditableAccrualsTable({ initialData = [], onDataChange }: EditableAccrualsTableProps) {
  const [data, setData] = useState<Accrual[]>(initialData)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [balanceSheetAmount, setBalanceSheetAmount] = useState<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const formatCurrency = (amount: number) => {
    if (amount === 0) return ''
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount))
  }

  const parseNumber = (value: string): number => {
    if (!value || value.trim() === '') return 0
    const cleaned = value.replace(/[^\d.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const calculateBalance = (accrual: Accrual): number => {
    return Object.values(accrual.monthlyEntries).reduce((sum, entry) => {
      return sum + entry.accrual + entry.reversal
    }, 0)
  }

  const calculateMonthlyTotals = (monthKey: string, type: 'reversal' | 'accrual'): number => {
    return data.reduce((sum, accrual) => {
      const entry = accrual.monthlyEntries[monthKey]
      return sum + (entry ? entry[type] : 0)
    }, 0)
  }

  const calculateGrandTotals = () => {
    const totalReversal = data.reduce((sum, accrual) => {
      return sum + Object.values(accrual.monthlyEntries).reduce((entrySum, entry) => entrySum + entry.reversal, 0)
    }, 0)
    
    const totalAccrual = data.reduce((sum, accrual) => {
      return sum + Object.values(accrual.monthlyEntries).reduce((entrySum, entry) => entrySum + entry.accrual, 0)
    }, 0)
    
    const totalBalance = data.reduce((sum, accrual) => sum + accrual.balance, 0)
    
    return { totalReversal, totalAccrual, totalBalance }
  }

  const calculateVariance = (): number => {
    const totalBalance = calculateGrandTotals().totalBalance
    return totalBalance - balanceSheetAmount
  }

  const updateData = (newData: Accrual[]) => {
    setData(newData)
    onDataChange?.(newData)
  }

  const handleCellClick = (rowId: string, field: string, monthKey?: string, type?: 'reversal' | 'accrual') => {
    const accrual = data.find(a => a.id === rowId)
    if (!accrual) return

    let currentValue = ''
    
    if (monthKey && type) {
      const entry = accrual.monthlyEntries[monthKey]
      currentValue = entry ? formatCurrency(entry[type]) : ''
    } else {
      switch (field) {
        case 'vendor':
          currentValue = accrual.vendor
          break
        case 'description':
          currentValue = accrual.description
          break
        case 'accrualJEAccountDR':
          currentValue = accrual.accrualJEAccountDR
          break
        case 'accrualJEAccountCR':
          currentValue = accrual.accrualJEAccountCR
          break
      }
    }

    setEditingCell({ rowId, field, monthKey, type })
    setEditValue(currentValue)
  }

  const handleCellSave = () => {
    if (!editingCell) return

    const newData = data.map(accrual => {
      if (accrual.id !== editingCell.rowId) return accrual

      const updatedAccrual = { ...accrual }

      if (editingCell.monthKey && editingCell.type) {
        // Update monthly entry
        const monthKey = editingCell.monthKey
        const currentEntry = updatedAccrual.monthlyEntries[monthKey] || { reversal: 0, accrual: 0 }
        
        updatedAccrual.monthlyEntries = {
          ...updatedAccrual.monthlyEntries,
          [monthKey]: {
            ...currentEntry,
            [editingCell.type]: parseNumber(editValue)
          }
        }
        
        // Recalculate balance
        updatedAccrual.balance = calculateBalance(updatedAccrual)
      } else {
        // Update basic field
        switch (editingCell.field) {
          case 'vendor':
            updatedAccrual.vendor = editValue
            break
          case 'description':
            updatedAccrual.description = editValue
            break
          case 'accrualJEAccountDR':
            updatedAccrual.accrualJEAccountDR = editValue
            break
          case 'accrualJEAccountCR':
            updatedAccrual.accrualJEAccountCR = editValue
            break
        }
      }

      return updatedAccrual
    })

    updateData(newData)
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditValue('')
    }
  }

  const addNewVendor = () => {
    const newAccrual: Accrual = {
      id: Math.random().toString(36).substr(2, 9),
      vendor: 'New Vendor',
      description: '',
      accrualJEAccountDR: '',
      accrualJEAccountCR: '20005',
      balance: 0,
      monthlyEntries: {}
    }

    updateData([...data, newAccrual])
  }

  const exportToCSV = () => {
    const headers = [
      'Vendor', 'Description', 'Accrual JE Account (DR)', 'Accrual JE Account (CR)',
      ...MONTH_COLUMNS.flatMap(month => [`${month.display} Reversal`, `${month.display} Accrual`]),
      'Balance'
    ]

    const rows = data.map(accrual => {
      const row = [
        accrual.vendor,
        accrual.description,
        accrual.accrualJEAccountDR,
        accrual.accrualJEAccountCR
      ]

      MONTH_COLUMNS.forEach(month => {
        const entry = accrual.monthlyEntries[month.key] || { reversal: 0, accrual: 0 }
        row.push(entry.reversal.toString(), entry.accrual.toString())
      })

      row.push(accrual.balance.toString())
      return row
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'accruals.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderCell = (accrual: Accrual, field: string, monthKey?: string, type?: 'reversal' | 'accrual') => {
    const isEditing = editingCell?.rowId === accrual.id && 
                     editingCell?.field === field && 
                     editingCell?.monthKey === monthKey && 
                     editingCell?.type === type

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="w-full h-full px-2 py-1 border-2 border-blue-500 outline-none bg-white text-gray-900 focus:bg-blue-50"
        />
      )
    }

    let displayValue = ''
    let cellClass = 'px-2 py-1 cursor-pointer hover:bg-gray-50 min-h-[32px] flex items-center text-gray-900'

    if (monthKey && type) {
      const entry = accrual.monthlyEntries[monthKey]
      const value = entry ? entry[type] : 0
      displayValue = value !== 0 ? formatCurrency(value) : ''
      if (type === 'reversal' && value < 0) {
        cellClass = cellClass.replace('text-gray-900', 'text-red-600')
      } else if (value !== 0) {
        cellClass = cellClass.replace('text-gray-900', 'text-gray-900')
      }
    } else {
      switch (field) {
        case 'vendor':
          displayValue = accrual.vendor
          break
        case 'description':
          displayValue = accrual.description
          break
        case 'accrualJEAccountDR':
          displayValue = accrual.accrualJEAccountDR
          break
        case 'accrualJEAccountCR':
          displayValue = accrual.accrualJEAccountCR
          break
        case 'balance':
          displayValue = formatCurrency(accrual.balance)
          cellClass = cellClass.replace('text-gray-900', 'text-gray-900') + ' font-semibold bg-gray-50'
          break
      }
    }

    return (
      <div
        className={cellClass}
        onClick={() => field !== 'balance' && handleCellClick(accrual.id, field, monthKey, type)}
      >
        {displayValue}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">20005 - Accrued Expenses</h2>
        <div className="flex items-center space-x-4">
          {/* Balance Sheet Input */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Balance Sheet:</label>
            <input
              type="number"
              value={balanceSheetAmount}
              onChange={(e) => setBalanceSheetAmount(parseFloat(e.target.value) || 0)}
              className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
              placeholder="0.00"
            />
          </div>
          
          {/* Variance Display */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Variance:</label>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              Math.abs(calculateVariance()) < 0.01 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {formatCurrency(calculateVariance())}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={addNewVendor} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-r border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 w-32">
                  Vendor
                </th>
                <th className="border-r border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 w-24">
                  Description
                </th>
                <th className="border-r border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 w-20">
                  Accrual JE Account (DR)
                </th>
                <th className="border-r border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 w-20">
                  Accrual JE Account (CR)
                </th>
                {MONTH_COLUMNS.map(month => (
                  <th key={month.key} className="border-r border-gray-300 text-center" colSpan={2}>
                    <div className="px-2 py-1 text-xs font-medium text-gray-700">
                      {month.display}
                    </div>
                    <div className="flex border-t border-gray-200">
                      <div className="flex-1 px-1 py-1 text-xs text-gray-600 border-r border-gray-200">
                        Reversal
                      </div>
                      <div className="flex-1 px-1 py-1 text-xs text-gray-600">
                        Accrual
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 w-24">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((accrual, index) => (
                <tr key={accrual.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-r border-gray-200 text-gray-900">
                    {renderCell(accrual, 'vendor')}
                  </td>
                  <td className="border-r border-gray-200 text-gray-900">
                    {renderCell(accrual, 'description')}
                  </td>
                  <td className="border-r border-gray-200 text-gray-900">
                    {renderCell(accrual, 'accrualJEAccountDR')}
                  </td>
                  <td className="border-r border-gray-200 text-gray-900">
                    {renderCell(accrual, 'accrualJEAccountCR')}
                  </td>
                  {MONTH_COLUMNS.map(month => (
                    <td key={month.key} className="border-r border-gray-200 p-0">
                      <div className="flex">
                        <div className="flex-1 border-r border-gray-200 text-gray-900">
                          {renderCell(accrual, 'monthlyEntry', month.key, 'reversal')}
                        </div>
                        <div className="flex-1 text-gray-900">
                          {renderCell(accrual, 'monthlyEntry', month.key, 'accrual')}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="border-r border-gray-200 text-gray-900">
                    {renderCell(accrual, 'balance')}
                  </td>
                </tr>
              ))}
              
              {/* Monthly Totals Row */}
              <tr className="bg-gray-100 border-t-2 border-gray-400 font-semibold">
                <td className="border-r border-gray-200 px-2 py-2 text-gray-900">
                  TOTALS
                </td>
                <td className="border-r border-gray-200 px-2 py-2 text-gray-900">
                  Monthly Totals
                </td>
                <td className="border-r border-gray-200 px-2 py-2 text-gray-900">
                  
                </td>
                <td className="border-r border-gray-200 px-2 py-2 text-gray-900">
                  
                </td>
                {MONTH_COLUMNS.map(month => {
                  const reversalTotal = calculateMonthlyTotals(month.key, 'reversal')
                  const accrualTotal = calculateMonthlyTotals(month.key, 'accrual')
                  return (
                    <td key={month.key} className="border-r border-gray-200 p-0">
                      <div className="flex">
                        <div className="flex-1 border-r border-gray-200 text-gray-900 px-2 py-2 text-center">
                          {reversalTotal !== 0 ? formatCurrency(reversalTotal) : ''}
                        </div>
                        <div className="flex-1 text-gray-900 px-2 py-2 text-center">
                          {accrualTotal !== 0 ? formatCurrency(accrualTotal) : ''}
                        </div>
                      </div>
                    </td>
                  )
                })}
                <td className="border-r border-gray-200 px-2 py-2 text-gray-900 text-center font-bold">
                  {formatCurrency(calculateGrandTotals().totalBalance)}
                </td>
              </tr>

              {/* Empty rows for adding new entries */}
              {Array.from({ length: 3 }).map((_, index) => (
                <tr key={`empty-${index}`} className="bg-white hover:bg-gray-50">
                  <td className="border-r border-gray-200 h-8"></td>
                  <td className="border-r border-gray-200 h-8"></td>
                  <td className="border-r border-gray-200 h-8"></td>
                  <td className="border-r border-gray-200 h-8"></td>
                  {MONTH_COLUMNS.map(month => (
                    <td key={month.key} className="border-r border-gray-200 h-8">
                      <div className="flex h-full">
                        <div className="flex-1 border-r border-gray-200"></div>
                        <div className="flex-1"></div>
                      </div>
                    </td>
                  ))}
                  <td className="border-r border-gray-200 h-8"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p>Click any cell to edit. Press Enter to save, Escape to cancel.</p>
        <p>Balance is automatically calculated from monthly entries.</p>
      </div>
    </div>
  )
}
