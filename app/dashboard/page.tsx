"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { BarChart3, Calculator, FileText, TrendingUp } from "lucide-react"
import Link from "next/link"

const stats = [
  {
    name: "Total Assets",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Calculator,
  },
  {
    name: "Monthly Depreciation",
    value: "$24,500",
    change: "+4.2%",
    changeType: "positive",
    icon: TrendingUp,
  },
  {
    name: "Asset Value",
    value: "$1.2M",
    change: "-2.1%",
    changeType: "negative",
    icon: BarChart3,
  },
  {
    name: "Reports Generated",
    value: "47",
    change: "+8.3%",
    changeType: "positive",
    icon: FileText,
  },
]

const quickActions = [
  {
    name: "Manage Assets",
    description: "View and edit your asset portfolio",
    href: "/dashboard/assets",
    icon: Calculator,
    color: "bg-blue-500",
  },
  {
    name: "Upload Data",
    description: "Import new asset data from CSV or Excel",
    href: "/dashboard/upload",
    icon: FileText,
    color: "bg-green-500",
  },
  {
    name: "View Reports",
    description: "Generate depreciation and financial reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    color: "bg-purple-500",
  },
  {
    name: "Analytics",
    description: "Deep dive into asset performance metrics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's what's happening with your assets."
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                          <div
                            className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === "positive"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group relative bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className={`inline-flex p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <span
                    className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                    aria-hidden="true"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                    </svg>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          New asset data uploaded
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        2 hours ago
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <BarChart3 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Monthly depreciation report generated
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        1 day ago
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative">
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Asset portfolio updated
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        3 days ago
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
