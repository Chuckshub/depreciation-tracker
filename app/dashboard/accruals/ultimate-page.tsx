"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UltimateAccrualTracker } from "@/components/accruals/ultimate-accrual-tracker"

export default function UltimateAccrualsPage() {
  return (
    <DashboardLayout 
      title="" 
      subtitle=""
    >
      <UltimateAccrualTracker />
    </DashboardLayout>
  )
}