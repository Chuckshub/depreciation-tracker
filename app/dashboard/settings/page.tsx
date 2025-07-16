"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Settings, User, Bell, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and application preferences">
      <div className="space-y-8">
        {/* Settings Categories */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Profile</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Update your personal information and preferences
            </p>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </div>

          {/* Notification Settings */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <Bell className="h-6 w-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Configure email and system notifications
            </p>
            <Button variant="outline" className="w-full">
              Manage Notifications
            </Button>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Password, two-factor authentication, and security logs
            </p>
            <Button variant="outline" className="w-full">
              Security Settings
            </Button>
          </div>
        </div>

        {/* Application Settings */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Application Settings</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Currency Settings */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Default Currency</h4>
                <p className="text-sm text-gray-500">Set the default currency for all financial calculations</p>
              </div>
              <select className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>CAD</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Date Format</h4>
                <p className="text-sm text-gray-500">Choose how dates are displayed throughout the application</p>
              </div>
              <select className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            {/* Depreciation Method */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Default Depreciation Method</h4>
                <p className="text-sm text-gray-500">Set the default method for new asset calculations</p>
              </div>
              <select className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Straight Line</option>
                <option>Declining Balance</option>
                <option>Sum of Years</option>
                <option>Units of Production</option>
              </select>
            </div>

            {/* Auto-save */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-save Changes</h4>
                <p className="text-sm text-gray-500">Automatically save changes as you make them</p>
              </div>
              <button
                type="button"
                className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-gray-400 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-500">Download all your asset data in CSV format</p>
              </div>
              <Button variant="outline">
                Export CSV
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Backup Database</h4>
                <p className="text-sm text-gray-500">Create a backup of your entire database</p>
              </div>
              <Button variant="outline">
                Create Backup
              </Button>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <h4 className="text-sm font-medium text-red-900">Clear All Data</h4>
                <p className="text-sm text-red-500">Permanently delete all assets and data (cannot be undone)</p>
              </div>
              <Button variant="destructive">
                Clear Data
              </Button>
            </div>
          </div>
        </div>

        {/* Save Changes */}
        <div className="flex justify-end">
          <Button>
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
