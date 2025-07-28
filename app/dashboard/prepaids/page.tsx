"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UltimatePrepaidTracker } from "@/components/prepaids/ultimate-prepaid-tracker"

export default function PrepaidsPage() {
  return (
    <DashboardLayout 
      title="" 
      subtitle=""
    >
      <UltimatePrepaidTracker />
    </DashboardLayout>
  )
}