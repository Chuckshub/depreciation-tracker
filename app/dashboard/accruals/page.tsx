"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Upload, DollarSign, Users, TrendingUp, Calendar, FileText, Download } from "lucide-react"
import { useState, useRef } from "react"
import { Accrual, AccrualSummary } from "@/types/accrual"
import { AccrualsCSVParser } from "@/lib/accruals-csv-parser"
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

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
      '6/30/25': { reversal: -40500.00, accrual: 40500.00 }
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
      '6/30/25': { reversal: -17245.00, accrual: 17245.00 }
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
      '6/30/25': { reversal: -31319.87, accrual: 52925.05 }
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
      '6/30/25': { reversal: -18000.00, accrual: 14765.91 }
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
      '7/31/25': { reversal: 0, accrual: 24598.17 }
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
      '7/31/25': { reversal: 0, accrual: 10000.00 }
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
      '7/31/25': { reversal: 0, accrual: 2437.50 }
    }
  }
]

const categoryColors: Record<string, string> = {
  'Sales': 'bg-green-100 text-green-800',
  'Marketing': 'bg-blue-100 text-blue-800',
  'Demand Gen': 'bg-purple-100 text-purple-800',
  'Cloud Costs': 'bg-orange-100 text-orange-800'
}

export default function AccrualsPage() {
  const [accruals, setAccruals] = useState<Accrual[]>(sampleAccruals)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateSummary = (): AccrualSummary => {
    const totalBalance = accruals.reduce((sum, accrual) => sum + accrual.balance, 0)
    const activeAccruals = accruals.filter(a => a.balance > 0).length
    const monthlyActivity = accruals.reduce((sum, accrual) => {
      const latestEntry = Object.values(accrual.monthlyEntries).pop()
      return sum + (latestEntry?.accrual || 0)
    }, 0)
    const vendorCount = new Set(accruals.map(a => a.vendor)).size

    return {
      totalBalance,
      activeAccruals,
      monthlyActivity,
      vendorCount
    }
  }

  const summary = calculateSummary()

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

  const generateChartData = () => {
    // Get all unique months from the data
    const allMonths = new Set<string>()
    accruals.forEach(accrual => {
      Object.keys(accrual.monthlyEntries).forEach(month => {
        allMonths.add(month)
      })
    })
    
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })

    // Generate datasets for each vendor
    const datasets = accruals.map((accrual, index) => {
      const data = sortedMonths.map(month => {
        const entry = accrual.monthlyEntries[month]
        return entry ? entry.accrual : 0
      })

      const colors = [
        'rgb(59, 130, 246)', // blue
        'rgb(16, 185, 129)', // green
        'rgb(139, 92, 246)', // purple
        'rgb(245, 158, 11)', // orange
        'rgb(239, 68, 68)',  // red
        'rgb(6, 182, 212)',  // cyan
        'rgb(168, 85, 247)', // violet
      ]

      return {
        label: accrual.vendor,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.1
      }
    })

    return {
      labels: sortedMonths,
      datasets
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Accruals by Vendor Over Time'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        }
      }
    }
  }

  return (
    <DashboardLayout title="Accruals" subtitle="Manage accrued expenses and track monthly activity">
      <div className="space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Accruals
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
                  <FileText className="h-8 w-8 text-blue-400" />
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
                  <Users className="h-8 w-8 text-purple-400" />
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
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Activity
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(summary.monthlyActivity)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Import Accruals Data</h2>
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
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            </div>
            
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
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Accruals Trend</h2>
            <div className="h-96">
              <Line data={generateChartData()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Accruals Table */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Accrued Expenses</h2>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accounts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accruals.map((accrual) => {
                    const latestEntry = Object.entries(accrual.monthlyEntries).pop()
                    return (
                      <tr key={accrual.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {accrual.vendor}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {accrual.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              categoryColors[accrual.description] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {accrual.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>DR: {accrual.accrualJEAccountDR}</div>
                          <div>CR: {accrual.accrualJEAccountCR}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(accrual.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {latestEntry && (
                            <div>
                              <div>{latestEntry[0]}</div>
                              <div className="text-xs">
                                Accrual: {formatCurrency(latestEntry[1].accrual)}
                                {latestEntry[1].reversal !== 0 && (
                                  <span className="ml-2">
                                    Reversal: {formatCurrency(latestEntry[1].reversal)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
