# Testing GL Balance and Excel Export Features

## Overview
New features added to the Depreciation History page:
1. **GL Balance Row** - Editable cells for entering actual GL balances
2. **Variance Row** - Automatic calculation of GL Balance - Calculated Balance
3. **Download Reconciliation** - Saves GL balances and exports Excel with journal entries

## Manual Test Steps

### 1. Navigate to Depreciation History
- Go to main reconciliation page
- Click "View Depreciation History" button
- Verify the page loads with the depreciation table

### 2. Test GL Balance Editing
- Scroll to bottom of the table
- Look for the **green "GL Balance" row**
- Click on any month cell in the GL Balance row
- Verify:
  - Cell becomes editable with number input
  - Input is focused automatically
  - Current value (0 or existing value) is pre-filled
- Enter a test amount (e.g., 5000.00)
- Press Enter or click outside
- Verify:
  - Cell shows the new amount formatted as currency
  - Value is saved in the component state

### 3. Test Variance Calculation
- After entering GL balances, look at the **yellow "Variance" row**
- Verify variance calculation:
  - **Positive variance** (green text): GL Balance > Calculated Balance
  - **Negative variance** (red text): GL Balance < Calculated Balance
  - **Zero variance** (gray text): GL Balance = Calculated Balance
- Formula: `Variance = GL Balance - Monthly Total`

### 4. Test Multiple GL Balance Entries
- Enter GL balances for multiple months
- Verify:
  - Each month calculates variance correctly
  - Total column shows sum of all GL balances
  - Total variance column shows sum of all variances

### 5. Test GL Balance Persistence
- Enter some GL balances
- Refresh the page
- Verify GL balances are loaded from Firebase (if configured)
- If Firebase not configured, balances will reset (expected behavior)

### 6. Test Download Reconciliation
- Enter GL balances for a few months
- Click "📊 Download Reconciliation" button
- Verify:
  - Button shows loading state with spinner
  - Button is disabled during download
  - File download starts automatically
  - Downloaded file is named: `depreciation-reconciliation-YYYY-MM-DD.csv`

### 7. Test Excel Export Content
Open the downloaded CSV file and verify it contains:

**Depreciation Schedule Section:**
- Header row with Asset, Account, Department, Date in Place, monthly columns, Total
- Asset rows with depreciation amounts for each month
- Monthly Total row
- GL Balance row with entered values
- Variance row with calculated differences

**Journal Entries Section:**
- Header: Account, Debit, Credit, Line Memo, Entity, Department, Class, Location
- Debit entry: "60003 - Depreciation Expense" for total depreciation
- Credit entry: "15003-1 - Accumulated Depreciation - Computer Equipment" for total depreciation
- Amounts should match the total monthly depreciation

### 8. Test Error Handling
- Try downloading without Firebase configured
- Verify appropriate error handling
- Test with invalid GL balance inputs (should accept numbers only)

## Expected Results

### Visual Elements
✅ **GL Balance Row**: Green background, editable cells
✅ **Variance Row**: Yellow background, color-coded values
✅ **Download Button**: Green button with loading states
✅ **Instructions**: Blue info box explaining functionality

### Calculations
✅ **Variance Formula**: `GL Balance - Monthly Total`
✅ **Color Coding**: Green (positive), Red (negative), Gray (zero)
✅ **Totals**: Correct sums in rightmost column

### Export Content
✅ **CSV Format**: Properly formatted with quotes and commas
✅ **Depreciation Data**: All assets and monthly amounts
✅ **GL Balances**: User-entered values
✅ **Variances**: Calculated differences
✅ **Journal Entries**: Proper debit/credit entries

### Journal Entry Template
Based on the provided format, journal entries should include:
- **Debit**: Depreciation Expense account
- **Credit**: Accumulated Depreciation account
- **Amounts**: Total monthly depreciation
- **Memo**: Descriptive line items
- **Entity/Department/Class/Location**: Standard values

## Sample Journal Entry Output
```
Account,Debit,Credit,Line Memo,Entity,Department,Class,Location
"60003 - Depreciation Expense",4471.34,0.00,"Monthly depreciation expense","Coder Technologies","General & Administrative","Operating Expense","Main Office"
"15003-1 - Accumulated Depreciation - Computer Equipment",0.00,4471.34,"Monthly accumulated depreciation","Coder Technologies","General & Administrative","Contra Asset","Main Office"
```

## Troubleshooting

**GL Balances not saving:**
- Check Firebase configuration
- Check browser console for API errors
- Verify `/api/gl-balances` endpoint is accessible

**Download not working:**
- Check browser console for errors
- Verify `/api/export/excel` endpoint is accessible
- Check if popup blockers are preventing download

**Variance calculations wrong:**
- Verify GL Balance values are entered correctly
- Check that Monthly Total row shows correct calculated amounts
- Formula should be: GL Balance - Monthly Total

**Excel file format issues:**
- File is CSV format (can be opened in Excel)
- Check for proper quote escaping in text fields
- Verify journal entries section is properly formatted
