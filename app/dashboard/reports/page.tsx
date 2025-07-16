"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FileText, Download, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

const reportTypes = [
  {
    name: "Monthly Depreciation Report",
    description: "Detailed breakdown of monthly depreciation by asset category",
    icon: Calendar,
    format: "PDF",
  },
  {
    name: "Asset Summary Report",
    description: "Complete overview of all assets and their current values",
    icon: FileText,
    format: "Excel",
  },
  {
    name: "Depreciation Analytics",
    description: "Visual charts and graphs showing depreciation trends",
    icon: BarChart3,
    format: "PDF",
  },
]

export default function ReportsPage() {
  return (
    <DashboardLayout title="Reports" subtitle="Generate and download financial reports">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reports Generated
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">47</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Downloads This Month
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">23</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Last Report
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">2 days ago</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-6">Available Reports</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => {
              const Icon = report.icon
              return (
                <div
                  key={report.name}
                  className="bg-white p-6 rounded-lg shadow border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    <Icon className="h-8 w-8 text-blue-500" />
                    <span className="ml-3 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {report.format}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {report.description}
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Monthly Depreciation - December 2024</p>
                    <p className="text-sm text-gray-500">Generated 2 days ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Asset Analytics Report</p>
                    <p className="text-sm text-gray-500">Generated 1 week ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Asset Summary - Q4 2024</p>
                    <p className="text-sm text-gray-500">Generated 2 weeks ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
