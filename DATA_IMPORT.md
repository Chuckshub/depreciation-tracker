# Data Import Guide

This guide explains how to import depreciation data from CSV files into the Firebase Firestore database.

## Overview

The data import system consists of three main components:

1. **CSV Parser** (`scripts/csv-parser.ts`) - Parses CSV files and converts them to Asset objects
2. **Data Importer** (`scripts/data-import.ts`) - Handles database operations (clear, import, stats)
3. **Admin API** (`app/api/admin/import/route.ts`) - Web API for bulk operations

## Prerequisites

1. Ensure your Firebase configuration is set up in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ADMIN_API_KEY=your_admin_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## CSV Format Requirements

Your CSV file should have the following columns:

- **Asset** (required) - Asset name/description
- **Date In Place** (required) - Date when asset was placed in service (MM/DD/YYYY format)
- **Account** - Account code/name
- **Department** - Department name
- **Cost** (required) - Original cost of the asset (numeric)
- **Life Months** (required) - Useful life in months (numeric, positive)
- **Monthly Dep** - Monthly depreciation amount (numeric)
- **Accum Dep** - Accumulated depreciation (numeric)
- **NBV** - Net Book Value (numeric)
- **Additional date columns** - Any columns with MM/DD/YYYY format will be treated as depreciation schedule entries

### Example CSV Structure:
```csv
Asset,Date In Place,Account,Department,Cost,Life Months,Monthly Dep,Accum Dep,NBV,01/01/2024,02/01/2024,03/01/2024
Computer Equipment,01/15/2024,Equipment,IT,5000,36,138.89,416.67,4583.33,138.89,138.89,138.89
Office Furniture,02/01/2024,Furniture,Admin,2000,60,33.33,66.66,1933.34,0,33.33,33.33
```

## Import Methods

### Method 1: Command Line Scripts

#### Parse CSV to JSON (optional step for validation)
```bash
npm run parse:csv path/to/your/data.csv [output.json]
```

#### Import CSV directly to database
```bash
npm run import:csv path/to/your/data.csv [--keep-existing]
```

#### Import from JSON file
```bash
npm run import:json path/to/your/data.json [--keep-existing]
```

#### Database operations
```bash
# View current database statistics
npm run db:stats

# Clear all assets from database
npm run db:clear
```

### Method 2: Admin API

The admin API provides web endpoints for bulk operations:

#### Get database statistics
```bash
curl "http://localhost:3000/api/admin/import?api_key=your_admin_key"
```

#### Clear all data
```bash
curl -X POST "http://localhost:3000/api/admin/import" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_admin_key" \
  -d '{"action": "clear"}'
```

#### Import assets
```bash
curl -X POST "http://localhost:3000/api/admin/import" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_admin_key" \
  -d '{
    "action": "import",
    "clearExisting": true,
    "assets": [...your asset array...]
  }'
```

## Import Process

### Recommended Steps:

1. **Backup existing data** (if any):
   ```bash
   npm run db:stats
   ```

2. **Validate your CSV** by parsing it first:
   ```bash
   npm run parse:csv your-data.csv validation-output.json
   ```
   Review the `validation-output.json` file to ensure data was parsed correctly.

3. **Import the data**:
   ```bash
   npm run import:csv your-data.csv
   ```
   This will:
   - Clear existing data
   - Parse the CSV
   - Validate all assets
   - Import valid assets to Firestore
   - Report any errors or invalid data

4. **Verify the import**:
   ```bash
   npm run db:stats
   ```

## Data Validation

The import process validates each asset:

- **Asset name** must not be empty
- **Date in place** must be provided
- **Cost** must be a non-negative number
- **Life months** must be a positive number

Invalid assets are reported but not imported. The process continues with valid assets.

## Error Handling

- **CSV parsing errors**: Check your CSV format, ensure proper escaping of commas and quotes
- **Firebase connection errors**: Verify your Firebase configuration in `.env.local`
- **Validation errors**: Review the error messages and fix the data in your CSV
- **Import errors**: Check Firestore permissions and quotas

## Security Notes

- The admin API uses a simple API key for authentication
- In production, implement proper authentication and authorization
- The current Firestore rules allow all read/write operations - restrict these for production
- Keep your admin API key secure and rotate it regularly

## Troubleshooting

### Common Issues:

1. **"Firebase configuration is missing"**
   - Check your `.env.local` file
   - Ensure all Firebase environment variables are set

2. **"Permission denied" errors**
   - Deploy your Firestore security rules
   - Check your Firebase project permissions

3. **CSV parsing errors**
   - Ensure your CSV uses proper formatting
   - Check for special characters in asset names
   - Verify date format is MM/DD/YYYY

4. **Import timeouts**
   - Large datasets are imported in batches
   - Check your internet connection
   - Verify Firestore quotas

## File Structure

```
scripts/
├── csv-parser.ts      # CSV parsing logic
└── data-import.ts     # Database import/export operations

app/api/admin/import/
└── route.ts           # Admin API endpoints

DATA_IMPORT.md         # This documentation
```

## Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your CSV format matches the requirements
3. Ensure your Firebase configuration is correct
4. Test with a small sample CSV first
