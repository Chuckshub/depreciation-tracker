// Core accrual interfaces
export interface Accrual {
  id: string
  vendor: string
  description: string
  accrualJEAccountDR: string
  accrualJEAccountCR: string
  balance: number
  monthlyEntries: Record<string, AccrualEntry>
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
  notes?: string
}

export interface AccrualEntry {
  reversal: number
  accrual: number
  notes?: string
}

export interface AccrualSummary {
  totalBalance: number
  activeAccruals: number
  monthlyActivity: number
  vendorCount: number
  totalReversal: number
  totalAccrual: number
  variance: number
  balanceSheetAmount: number
}

// API and validation interfaces
export interface CreateAccrualRequest {
  vendor: string
  description: string
  accrualJEAccountDR: string
  accrualJEAccountCR: string
  balance?: number
  monthlyEntries?: Record<string, AccrualEntry>
  notes?: string
  isActive?: boolean
}

export interface UpdateAccrualRequest extends Partial<CreateAccrualRequest> {
  id: string
}

export interface AccrualValidationError {
  field: string
  message: string
  code: string
}

export interface AccrualValidationResult {
  isValid: boolean
  errors: AccrualValidationError[]
}

// CSV import interfaces
export interface AccrualCSVImportResult {
  accruals: Accrual[]
  errors: string[]
  warnings: string[]
  summary: {
    totalRows: number
    successfulImports: number
    failedImports: number
    skippedRows: number
  }
}

export interface AccrualCSVRow {
  vendor: string
  description: string
  accrualJEAccountDR: string
  accrualJEAccountCR: string
  balance: string
  [monthKey: string]: string // For dynamic month columns
}

// Filter and sort interfaces
export interface AccrualFilter {
  vendor?: string
  description?: string
  account?: string
  minBalance?: number
  maxBalance?: number
  hasActivity?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

export type AccrualSortField = 'vendor' | 'description' | 'balance' | 'accrualJEAccountDR' | 'accrualJEAccountCR' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface AccrualSort {
  field: AccrualSortField
  direction: SortDirection
}

// Table and UI interfaces
export interface AccrualTableColumn {
  key: string
  label: string
  sortable: boolean
  width?: string
  type: 'text' | 'number' | 'currency' | 'date'
  editable?: boolean
}

export interface AccrualTableState {
  data: Accrual[]
  filteredData: Accrual[]
  sort: AccrualSort | null
  filter: AccrualFilter
  selectedRows: string[]
  editingCell: {
    rowId: string
    field: string
    monthKey?: string
    type?: 'reversal' | 'accrual'
  } | null
}

// Bulk operations
export interface AccrualBulkOperation {
  type: 'delete' | 'update' | 'export'
  accrualIds: string[]
  updateData?: Partial<Accrual>
}

export interface AccrualBulkOperationResult {
  success: boolean
  processedCount: number
  errors: Array<{
    accrualId: string
    error: string
  }>
}

// Month utilities
export interface MonthColumn {
  key: string // e.g., "6/25"
  display: string // e.g., "6/25"
  shortDisplay: string // e.g., "Jun"
  monthName: string // e.g., "June"
  year: number
  month: number
}

// Account code validation
export interface AccountCode {
  code: string
  name: string
  type: 'DR' | 'CR'
  category: string
}

// Export interfaces
export interface AccrualExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  includeMonthlyDetails: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  selectedAccruals?: string[]
}

export interface AccrualExportResult {
  success: boolean
  filename: string
  downloadUrl?: string
  error?: string
}
