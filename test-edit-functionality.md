# Testing Edit Functionality

## Manual Test Steps

### 1. Load the Reconciliation Page
- Navigate to the main page (reconciliation)
- Verify that assets are loaded and displayed in the table
- Look for the blue instruction box explaining editable fields

### 2. Test Date in Place Editing
- Click on any "Date in Place" cell
- Verify that:
  - Cell becomes editable with a date input
  - Input is focused automatically
  - Current date is pre-filled in YYYY-MM-DD format
- Change the date and press Enter or click outside
- Verify that:
  - Cell shows the new formatted date
  - Cell has yellow background indicating it's modified
  - Yellow dot (●) appears next to the value
  - "View Depreciation History" button shows a change count badge

### 3. Test Life (Months) Editing
- Click on any "Life (Months)" cell
- Verify that:
  - Cell becomes editable with a number input
  - Input is focused automatically
  - Current value is pre-filled
- Change the number and press Enter or click outside
- Verify that:
  - Cell shows the new number
  - Cell has yellow background indicating it's modified
  - Monthly Dep value is automatically recalculated (cost / new life months)
  - Yellow dot (●) appears next to the value
  - "View Depreciation History" button shows updated change count

### 4. Test Escape Key
- Start editing a cell
- Press Escape key
- Verify that editing is cancelled and original value is restored

### 5. Test Multiple Edits
- Edit multiple assets (both date and life months)
- Verify that:
  - All modified assets show yellow highlighting
  - Change count badge shows correct number
  - Each modified asset has the yellow dot indicator

### 6. Test Save Functionality
- Make some edits to assets
- Click "View Depreciation History" button
- Verify that:
  - Button shows "Saving Changes..." with spinner
  - Button is disabled during save
  - If Firebase is configured: Changes are saved and page navigates
  - If Firebase not configured: Appropriate error message is shown

### 7. Test Validation
- Try to enter invalid values:
  - Negative numbers for life months
  - Invalid dates
- Verify that validation prevents invalid values

## Expected Behavior

✅ **Visual Feedback**
- Modified cells have yellow background
- Yellow dot indicator for changes
- Change count badge on button
- Hover effects on editable cells

✅ **Interaction**
- Click to edit
- Enter to save
- Escape to cancel
- Auto-focus on edit
- Auto-blur to save

✅ **Calculations**
- Monthly depreciation recalculates when life months change
- Formula: Monthly Dep = Cost / Life Months

✅ **Persistence**
- Changes tracked in component state
- Saved to Firebase when "View Depreciation History" is clicked
- Error handling for save failures

## Troubleshooting

If editing doesn't work:
1. Check browser console for JavaScript errors
2. Verify that assets have valid `id` fields
3. Check that Firebase is properly configured (if using Firebase)
4. Ensure the update API route is accessible

If saves fail:
1. Check browser network tab for API call failures
2. Verify Firebase configuration
3. Check server logs for error messages
4. Ensure proper permissions in Firebase
