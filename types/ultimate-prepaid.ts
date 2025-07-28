// Ultimate Prepaid Tracker Types

export interface PrepaidVendor {
  id: string
  name: string
  description?: string
  category?: string // e.g., 'Insurance', 'Software', 'Rent', 'Marketing'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AmortizationEntry {
  month: string // "MM/YY" format
  amortization: number
  remainingBalance: number
  isActual: boolean // true if actual, false if projected
  notes?: string
}

export interface PrepaidRecord {
  id: string
  vendorId: string
  vendor: PrepaidVendor
  description: string
  initialAmount: number
  startDate: Date
  endDate: Date
  termMonths: number
  monthlyAmortization: number
  currentBalance: number
  amortizationSchedule: Record<string, AmortizationEntry> // key: "MM/YY"
  glAccount: string // GL account code
  expenseAccount: string // Expense account code
  isActive: boolean
  isFullyAmortized: boolean
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface MonthColumn {
  key: string // "4/25"
  month: number // 4
  year: number // 2025
  displayName: string // "4/25"
  fullName: string // "April 2025"
  isCurrentMonth: boolean
  isPastMonth: boolean
  isFutureMonth: boolean
}

export interface PrepaidSummary {
  totalInitialAmount: number
  totalCurrentBalance: number
  totalAmortizedToDate: number
  totalMonthlyAmortization: number
  monthlyAmortizationTotals: Record<string, number>
  vendorCount: number
  activeVendorCount: number
  fullyAmortizedCount: number
  averageTermMonths: number
  upcomingExpirations: PrepaidRecord[] // expiring in next 3 months
}

export interface PrepaidState {
  vendors: PrepaidVendor[]
  records: PrepaidRecord[]
  months: MonthColumn[]
  balanceSheetAmount: number
  variance: number
  summary: PrepaidSummary
  isLoading: boolean
  error: string | null
  selectedPeriod: {
    startMonth: string
    endMonth: string
  }
}

export interface EditingCell {
  recordId: string
  monthKey: string
  field: 'amortization'
  value: string
}

export interface PrepaidFormData {
  vendorName: string
  description: string
  category?: string
  initialAmount: number
  startDate: Date
  termMonths: number
  glAccount: string
  expenseAccount: string
  notes?: string
}

export interface AmortizationCalculation {
  monthlyAmount: number
  schedule: AmortizationEntry[]
  totalAmortization: number
  remainingBalance: number
}

// Reconciliation types
export interface ReconciliationItem {
  id: string
  description: string
  prepaidBalance: number
  glBalance: number
  variance: number
  isReconciled: boolean
  notes?: string
}

export interface ReconciliationSummary {
  totalPrepaidBalance: number
  totalGLBalance: number
  totalVariance: number
  reconciledItems: number
  unreconciledItems: number
  reconciliationPercentage: number
}

// Import/Export types
export interface PrepaidImportResult {
  success: boolean
  recordsImported: number
  vendorsCreated: number
  errors: string[]
  warnings: string[]
  summary: {
    totalRows: number
    successfulImports: number
    failedImports: number
    skippedRows: number
  }
}

export interface PrepaidExportOptions {
  includeInactive: boolean
  includeFullyAmortized: boolean
  dateRange?: {
    startMonth: string
    endMonth: string
  }
  format: 'csv' | 'xlsx'
  includeSchedule: boolean
}

// Filter and sort types
export interface PrepaidFilter {
  searchTerm: string
  category?: string
  showInactive: boolean
  showFullyAmortized: boolean
  minBalance?: number
  maxBalance?: number
  expiringWithinMonths?: number
  glAccount?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export type PrepaidSortField = 'vendor' | 'balance' | 'startDate' | 'endDate' | 'monthlyAmortization' | 'category'
export type SortDirection = 'asc' | 'desc'

export interface PrepaidSort {
  field: PrepaidSortField
  direction: SortDirection
}

// View modes
export type PrepaidViewMode = 'spreadsheet' | 'summary' | 'reconciliation' | 'schedule'

// Table props
export interface PrepaidTableProps {
  state: PrepaidState
  onUpdateRecord: (recordId: string, monthKey: string, amortization: number) => void
  onAddVendor: (vendor: PrepaidFormData) => void
  onDeleteVendor: (vendorId: string) => void
  onUpdateBalanceSheet: (amount: number) => void
  onImport: (file: File) => Promise<PrepaidImportResult>
  onExport: (options: PrepaidExportOptions) => void
  editingCell: EditingCell | null
  onStartEdit: (cell: EditingCell) => void
  onEndEdit: () => void
  filterOptions: PrepaidFilter
  onUpdateFilter: (options: Partial<PrepaidFilter>) => void
  viewMode: PrepaidViewMode
  onViewModeChange: (mode: PrepaidViewMode) => void
}

// Validation types
export interface PrepaidValidationError {
  field: string
  message: string
  code: string
}

export interface PrepaidValidationResult {
  isValid: boolean
  errors: PrepaidValidationError[]
}

// API types
export interface PrepaidApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface BulkAmortizationUpdate {
  updates: Array<{
    recordId: string
    monthKey: string
    amortization: number
  }>
}

// Keyboard navigation
export interface PrepaidCellPosition {
  recordIndex: number
  monthIndex: number
}

export interface PrepaidNavigationDirection {
  row: number // -1, 0, 1
  col: number // -1, 0, 1
}

// Undo/Redo functionality
export interface PrepaidAction {
  type: 'UPDATE_AMORTIZATION' | 'ADD_VENDOR' | 'DELETE_VENDOR' | 'BULK_UPDATE' | 'ADD_PREPAID'
  timestamp: Date
  data: any
  description: string
}

export interface PrepaidUndoRedoState {
  history: PrepaidAction[]
  currentIndex: number
  maxHistorySize: number
}

// Analytics and reporting
export interface PrepaidAnalytics {
  monthlyTrends: {
    month: string
    totalAmortization: number
    newPrepaids: number
    expiredPrepaids: number
  }[]
  categoryBreakdown: {
    category: string
    totalAmount: number
    currentBalance: number
    percentage: number
  }[]
  vendorAnalysis: {
    vendor: string
    totalPrepaids: number
    totalAmount: number
    averageTerm: number
  }[]
  expirationForecast: {
    month: string
    expiringAmount: number
    expiringCount: number
  }[]
}

// Alerts and notifications
export interface PrepaidAlert {
  id: string
  type: 'expiring' | 'variance' | 'error' | 'warning'
  title: string
  message: string
  recordId?: string
  severity: 'low' | 'medium' | 'high'
  isRead: boolean
  createdAt: Date
}

// Configuration
export interface PrepaidConfig {
  autoCalculateAmortization: boolean
  defaultTermMonths: number
  warningThresholdMonths: number // warn when prepaid expires within X months
  defaultGLAccount: string
  defaultExpenseAccount: string
  autoSave: boolean
  autoSaveInterval: number
  maxUndoHistory: number
  dateFormat: string
  currencyFormat: string
  reconciliationTolerance: number // acceptable variance for reconciliation
}

// Amortization methods
export type AmortizationMethod = 'straight-line' | 'accelerated' | 'custom'

export interface AmortizationMethodConfig {
  method: AmortizationMethod
  customSchedule?: number[] // for custom method
  accelerationFactor?: number // for accelerated method
}

// Approval workflow (for enterprise features)
export interface PrepaidApproval {
  id: string
  recordId: string
  requestedBy: string
  requestedAt: Date
  approvedBy?: string
  approvedAt?: Date
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  amount: number
  type: 'new' | 'adjustment' | 'deletion'
}

// Audit trail
export interface PrepaidAuditEntry {
  id: string
  recordId: string
  action: string
  oldValue?: any
  newValue?: any
  userId: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// Integration types
export interface GLIntegration {
  enabled: boolean
  endpoint: string
  apiKey: string
  syncFrequency: 'manual' | 'daily' | 'weekly' | 'monthly'
  lastSync?: Date
  mapping: {
    prepaidAccount: string
    expenseAccount: string
  }
}

// Performance optimization
export interface PrepaidVirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  threshold: number
}

// Theme customization
export interface PrepaidTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    hover: string
    selected: string
    expired: string
    expiring: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Backup and restore
export interface PrepaidBackup {
  id: string
  timestamp: Date
  version: string
  data: {
    vendors: PrepaidVendor[]
    records: PrepaidRecord[]
    config: PrepaidConfig
  }
  size: number
  checksum: string
}

export interface PrepaidRestoreOptions {
  backupId: string
  restoreVendors: boolean
  restoreRecords: boolean
  restoreConfig: boolean
  createBackupBeforeRestore: boolean
}