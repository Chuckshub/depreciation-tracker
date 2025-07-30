"use client"

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UltimatePrepaidTracker } from "@/components/prepaids/ultimate-prepaid-tracker"
import { SaveButton, SaveStatus } from "@/components/ui/save-button"
import { usePrepaids } from "@/lib/hooks/usePrepaids"
import { PrepaidRecord } from "@/types/ultimate-prepaid"

export default function PrepaidsPage() {
  const { prepaids, loading, error, fetchPrepaids, saveChanges } = usePrepaids()
  const [localPrepaids, setLocalPrepaids] = useState<PrepaidRecord[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  // Load prepaids on mount
  useEffect(() => {
    fetchPrepaids()
  }, [fetchPrepaids])

  // Update local state when prepaids change
  useEffect(() => {
    setLocalPrepaids(prepaids)
    setHasChanges(false)
  }, [prepaids])

  // Handle data changes from the tracker component
  const handleDataChange = (updatedPrepaids: PrepaidRecord[]) => {
    setLocalPrepaids(updatedPrepaids)
    setHasChanges(JSON.stringify(updatedPrepaids) !== JSON.stringify(prepaids))
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await saveChanges(localPrepaids)
      if (success) {
        setHasChanges(false)
        setLastSaved(new Date())
      }
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout 
      title="Prepaids Management" 
      subtitle="Track and manage prepaid expenses with amortization schedules"
    >
      <div className="space-y-4">
        {/* Save Controls */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <SaveStatus 
            hasChanges={hasChanges} 
            lastSaved={lastSaved} 
            error={error} 
          />
          <SaveButton 
            onSave={handleSave}
            loading={saving}
            hasChanges={hasChanges}
            disabled={loading}
          />
        </div>

        {/* Prepaids Tracker */}
        <UltimatePrepaidTracker 
          initialData={localPrepaids}
          onDataChange={handleDataChange}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
}