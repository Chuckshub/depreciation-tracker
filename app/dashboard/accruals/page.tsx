"use client"

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UltimateAccrualTracker } from "@/components/accruals/ultimate-accrual-tracker"
import { SaveButton, SaveStatus } from "@/components/ui/save-button"
import { useAccruals } from "@/lib/hooks/useAccruals"
import { Accrual } from "@/types/accrual"

export default function AccrualsPage() {
  const { accruals, loading, error, fetchAccruals, saveChanges } = useAccruals()
  const [localAccruals, setLocalAccruals] = useState<Accrual[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)

  // Load accruals on mount
  useEffect(() => {
    fetchAccruals()
  }, [fetchAccruals])

  // Update local state when accruals change
  useEffect(() => {
    setLocalAccruals(accruals)
    setHasChanges(false)
  }, [accruals])

  // Handle data changes from the tracker component
  const handleDataChange = (updatedAccruals: Accrual[]) => {
    setLocalAccruals(updatedAccruals)
    setHasChanges(JSON.stringify(updatedAccruals) !== JSON.stringify(accruals))
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await saveChanges(localAccruals)
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
      title="Accruals Management" 
      subtitle="Track and manage monthly accruals with real-time updates"
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

        {/* Accruals Tracker */}
        <UltimateAccrualTracker 
          initialData={localAccruals}
          onDataChange={handleDataChange}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
}