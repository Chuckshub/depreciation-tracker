export interface Accrual {
  id: string
  vendor: string
  description: string
  accrualJEAccountDR: string
  accrualJEAccountCR: string
  balance: number
  monthlyEntries: Record<string, AccrualEntry>
}

export interface AccrualEntry {
  reversal: number
  accrual: number
}

export interface AccrualSummary {
  totalBalance: number
  activeAccruals: number
  monthlyActivity: number
  vendorCount: number
}
