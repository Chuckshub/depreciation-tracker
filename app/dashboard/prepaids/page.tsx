"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Calendar, DollarSign, Clock, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

interface Prepaid {
  id: string
  name: string
  totalAmount: number
  remainingAmount: number
  startDate: string
  endDate: string
  monthlyAmortization: number
  category: string
  status: 'Active' | 'Expired' | 'Pending'
}

const mockPrepaids: Prepaid[] = [
  {
    id: '1',
    name: 'Software License - Adobe Creative Suite',
    totalAmount: 12000,
    remainingAmount: 8000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyAmortization: 1000,
    category: 'Software',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Insurance Premium - General Liability',
    totalAmount: 24000,
    remainingAmount: 18000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyAmortization: 2000,
    category: 'Insurance',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Rent Prepayment - Office Space',
    totalAmount: 36000,
    remainingAmount: 0,
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    monthlyAmortization: 3000,
    category: 'Rent',
    status: 'Expired'
  },
  {
    id: '4',
    name: 'Marketing Campaign - Q1 2025',
    totalAmount: 15000,
    remainingAmount: 15000,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    monthlyAmortization: 5000,
    category: 'Marketing',
    status: 'Pending'
  }
]

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Expired: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800'
}

const categoryColors = {
  Software: 'bg-blue-100 text-blue-800',
  Insurance: 'bg-purple-100 text-purple-800',
  Rent: 'bg-orange-100 text-orange-800',
  Marketing: 'bg-pink-100 text-pink-800'
}

export default function PrepaidsPage() {
  const [prepaids] = useState<Prepaid[]>(mockPrepaids)
  const [showAddForm, setShowAddForm] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressPercentage = (total: number, remaining: number) => {
    return ((total - remaining) / total) * 100
  }

  const totalPrepaids = prepaids.reduce((sum, prepaid) => sum + prepaid.totalAmount, 0)
  const totalRemaining = prepaids.reduce((sum, prepaid) => sum + prepaid.remainingAmount, 0)
  const activePrepaids = prepaids.filter(p => p.status === 'Active').length
  const monthlyAmortization = prepaids
    .filter(p => p.status === 'Active')
    .reduce((sum, prepaid) => sum + prepaid.monthlyAmortization, 0)

  return (
    <DashboardLayout title="Prepaids" subtitle="Manage prepaid expenses and track amortization">
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
                      Total Prepaids
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalPrepaids)}
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
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Remaining Balance
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(totalRemaining)}
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
                  <CreditCard className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Prepaids
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {activePrepaids}
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
                  <Calendar className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Amortization
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(monthlyAmortization)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Prepaid Expenses</h2>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prepaid
          </Button>
        </div>

        {/* Prepaids Table */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prepaid Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prepaids.map((prepaid) => {
                  const progress = getProgressPercentage(prepaid.totalAmount, prepaid.remainingAmount)
                  return (
                    <tr key={prepaid.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prepaid.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[prepaid.category as keyof typeof categoryColors]}`}>
                              {prepaid.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(prepaid.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Remaining: {formatCurrency(prepaid.remainingAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.toFixed(1)}% amortized
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(prepaid.startDate)}</div>
                        <div>to {formatDate(prepaid.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(prepaid.monthlyAmortization)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[prepaid.status]}`}>
                          {prepaid.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Form Modal Placeholder */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Prepaid</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Prepaid form functionality will be implemented here.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowAddForm(false)}>
                    Add Prepaid
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
