// Ultimate Accrual Tracker Types

export interface AccrualVendor {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MonthlyEntry {
  reversal: number
  accrual: number
  notes?: string
}

export interface AccrualRecord {
  id: string
  vendorId: string
  vendor: AccrualVendor
  monthlyEntries: Record<string, MonthlyEntry> // key format: "MM/YY"
  balance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MonthColumn {
  key: string // "4/25"
  month: number // 4
  year: number // 2025
  displayName: string // "4/25"
  fullName: string // "April 2025"
}

export interface AccrualSummary {
  totalReversals: number
  totalAccruals: number
  netBalance: number
  monthlyTotals: Record<string, { reversals: number; accruals: number }>
  vendorCount: number
  activeVendorCount: number
}

export interface AccrualState {
  vendors: AccrualVendor[]
  records: AccrualRecord[]
  months: MonthColumn[]
  balanceSheetAmount: number
  variance: number
  summary: AccrualSummary
  isLoading: boolean
  error: string | null
}

export interface EditingCell {
  recordId: string
  monthKey: string
  field: 'reversal' | 'accrual'
  value: string
}

export interface AccrualFormData {
  vendorName: string
  description?: string
}

export interface ImportResult {
  success: boolean
  recordsImported: number
  vendorsCreated: number
  errors: string[]
  warnings: string[]
}

export interface ExportOptions {
  includeInactive: boolean
  dateRange?: {
    startMonth: string
    endMonth: string
  }
  format: 'csv' | 'xlsx'
}

// Utility types for calculations
export type CalculationMode = 'monthly' | 'yearly' | 'custom'
export type ViewMode = 'spreadsheet' | 'summary'
export type SortField = 'vendor' | 'balance' | 'activity' | 'created'
export type SortDirection = 'asc' | 'desc'

export interface FilterOptions {
  searchTerm: string
  showInactive: boolean
  minBalance?: number
  maxBalance?: number
  hasActivity: boolean | null
  dateRange?: {
    start: string
    end: string
  }
}

export interface AccrualTableProps {
  state: AccrualState
  onUpdateRecord: (recordId: string, monthKey: string, field: 'reversal' | 'accrual', value: number) => void
  onAddVendor: (vendor: AccrualFormData) => void
  onDeleteVendor: (vendorId: string) => void
  onUpdateBalanceSheet: (amount: number) => void
  onImport: (file: File) => Promise<ImportResult>
  onExport: (options: ExportOptions) => void
  editingCell: EditingCell | null
  onStartEdit: (cell: EditingCell) => void
  onEndEdit: () => void
  filterOptions: FilterOptions
  onUpdateFilter: (options: Partial<FilterOptions>) => void
}

// Validation types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// API types
export interface AccrualApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface BulkUpdateRequest {
  updates: Array<{
    recordId: string
    monthKey: string
    field: 'reversal' | 'accrual'
    value: number
  }>
}

// Keyboard navigation
export interface CellPosition {
  recordIndex: number
  monthIndex: number
  field: 'reversal' | 'accrual'
}

export interface NavigationDirection {
  row: number // -1, 0, 1
  col: number // -1, 0, 1
  field?: 'reversal' | 'accrual'
}

// Undo/Redo functionality
export interface AccrualAction {
  type: 'UPDATE_CELL' | 'ADD_VENDOR' | 'DELETE_VENDOR' | 'BULK_UPDATE'
  timestamp: Date
  data: any
  description: string
}

export interface UndoRedoState {
  history: AccrualAction[]
  currentIndex: number
  maxHistorySize: number
}

// Performance optimization
export interface VirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  threshold: number // number of rows before virtualization kicks in
}

// Theme and customization
export interface AccrualTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    hover: string
    selected: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
  }
}

// Configuration
export interface AccrualConfig {
  autoSave: boolean
  autoSaveInterval: number // milliseconds
  maxUndoHistory: number
  defaultCurrency: string
  dateFormat: string
  theme: AccrualTheme
  virtualization: VirtualizationConfig
  validation: {
    maxVendorNameLength: number
    maxDescriptionLength: number
    maxAmount: number
    minAmount: number
  }
}