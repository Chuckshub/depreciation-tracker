"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'

interface SaveButtonProps {
  onSave: () => Promise<void> | void
  loading?: boolean
  disabled?: boolean
  hasChanges?: boolean
  className?: string
  children?: React.ReactNode
}

export function SaveButton({ 
  onSave, 
  loading = false, 
  disabled = false, 
  hasChanges = false,
  className = '',
  children 
}: SaveButtonProps) {
  const handleClick = async () => {
    if (!loading && !disabled) {
      await onSave()
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading || disabled || !hasChanges}
      className={`${className} ${hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          {children || 'Save Changes'}
        </>
      )}
    </Button>
  )
}

export function SaveStatus({ 
  hasChanges, 
  lastSaved, 
  error 
}: { 
  hasChanges: boolean
  lastSaved?: Date | null
  error?: string | null 
}) {
  if (error) {
    return (
      <div className="text-sm text-red-600 flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
        Error: {error}
      </div>
    )
  }

  if (hasChanges) {
    return (
      <div className="text-sm text-amber-600 flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
        Unsaved changes
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="text-sm text-green-600 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Saved {lastSaved.toLocaleTimeString()}
      </div>
    )
  }

  return (
    <div className="text-sm text-gray-500 flex items-center">
      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
      No changes
    </div>
  )
}
