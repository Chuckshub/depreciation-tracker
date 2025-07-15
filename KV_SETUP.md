# Vercel KV (Upstash Redis) Setup Guide

This application now uses Vercel KV for persistent asset data storage instead of local JSON files.

## Setup Instructions

### 1. Create a Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "KV"
4. Choose a name for your database (e.g., "depreciation-tracker-kv")
5. Select your preferred region
6. Click "Create"

### 2. Get Your KV Credentials

1. After creating the database, click on it to view details
2. Go to the "Settings" tab
3. Copy the following environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 3. Configure Environment Variables

#### For Local Development:
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual KV credentials:

```bash
KV_REST_API_URL=https://your-actual-kv-instance.upstash.io
KV_REST_API_TOKEN=your_actual_token_here
```

#### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the same variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
4. Make sure they're available for all environments (Production, Preview, Development)

## API Endpoints

### GET /api/assets
Returns all assets from KV storage. If KV is unavailable or empty, returns sample data.

**Response:**
```json
{
  "assets": [
    {
      "id": "asset-001",
      "asset": "Kyle Carberry - MacBook Pro",
      "dateInPlace": "2023-02-01T00:00:00.000Z",
      "account": "15003 - Computer Equipment",
      "department": "Research & Development : Research Engineering",
      "cost": 1517.21,
      "lifeMonths": 36,
      "monthlyDep": 42.14,
      "accumDep": 1222,
      "nbv": 295.21,
      "depSchedule": {
        "01/01/2025": 42.14,
        "02/01/2025": 42.14,
        // ... more months
      }
    }
    // ... more assets
  ]
}
```

### POST /api/add-asset
Adds a new asset to KV storage.

**Request Body:**
```json
{
  "asset": "John Doe - MacBook Pro",
  "account": "15003 - Computer Equipment",
  "department": "Research & Development : Engineering",
  "cost": 2500.00,
  "lifeMonths": 36,
  "dateInPlace": "2025-01-15T00:00:00.000Z" // optional
}
```

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "asset-007",
    "asset": "John Doe - MacBook Pro",
    // ... full asset object with calculated values
  },
  "totalAssets": 7
}
```

## Features

### Automatic Calculations
When adding a new asset, the system automatically calculates:
- **Monthly Depreciation**: `cost / lifeMonths`
- **Accumulated Depreciation**: Based on months elapsed since `dateInPlace`
- **Net Book Value (NBV)**: `cost - accumulatedDepreciation`
- **Depreciation Schedule**: Monthly depreciation amounts for the asset's entire life

### Fallback Behavior
If Vercel KV is unavailable (e.g., during development with invalid credentials), the application falls back to sample data, ensuring the app remains functional.

### Data Persistence
All asset data is now stored in Vercel KV and persists across:
- Application restarts
- Deployments
- Different environments (when properly configured)

## Migration from JSON

The application has been migrated from using `/public/depreciation_prod.json` to Vercel KV. The old JSON file is no longer used, but the data structure remains the same for compatibility.

## Troubleshooting

### KV Connection Issues
If you see errors like "getaddrinfo ENOTFOUND", check:
1. Your environment variables are correctly set
2. The KV_REST_API_URL is valid
3. The KV_REST_API_TOKEN has the correct permissions

### Development Without KV
The application will work in development mode even without valid KV credentials, using sample data as a fallback.

### Production Deployment
Ensure your Vercel project has the KV environment variables configured before deploying to production.
