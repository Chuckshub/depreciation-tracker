# Firebase Firestore Setup Guide

This application now uses Firebase Firestore for persistent asset data storage instead of local JSON files.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "depreciation-tracker")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Set Up Firestore Database

1. In your Firebase project console, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode"
4. Select a location for your database (choose closest to your users)
5. Click "Done"

### 3. Get Your Firebase Configuration

1. In the Firebase console, click the gear icon (⚙️) and select "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>) 
4. Register your app with a nickname (e.g., "depreciation-tracker-web")
5. Copy the Firebase configuration object

### 4. Configure Environment Variables

#### For Local Development:
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values with your actual Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

#### For Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the same variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Make sure they're available for all environments (Production, Preview, Development)

### 5. Deploy Firestore Security Rules (Optional)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init firestore`
4. Deploy security rules: `firebase deploy --only firestore:rules`

The included `firestore.rules` file allows read/write access to the assets collection. For production, consider adding authentication.

## API Endpoints

### GET /api/assets
Returns all assets from Firestore. If Firestore is unavailable or empty, returns sample data.

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
Adds a new asset to Firestore.

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
If Firebase Firestore is unavailable (e.g., during development with invalid credentials), the application falls back to sample data, ensuring the app remains functional.

### Data Persistence
All asset data is now stored in Firebase Firestore and persists across:
- Application restarts
- Deployments
- Different environments (when properly configured)
- Real-time synchronization across multiple clients

### Real-time Updates
Firebase Firestore provides real-time updates, so changes made by one user will be immediately visible to other users (when implemented with real-time listeners).

## Migration from Vercel KV

The application has been migrated from Vercel KV to Firebase Firestore. Key changes:
- Replaced `@vercel/kv` with `firebase` SDK
- Updated API routes to use Firestore operations
- Changed environment variables from KV to Firebase configuration
- Added Firestore security rules and configuration files

## Firestore Data Structure

### Collection: `assets`
Each document in the assets collection contains:
```javascript
{
  id: string,           // Unique asset identifier
  asset: string,        // Asset name/description
  dateInPlace: string,  // ISO date string
  account: string,      // Account code
  department: string,   // Department name
  cost: number,         // Asset cost
  lifeMonths: number,   // Depreciation life in months
  monthlyDep: number,   // Monthly depreciation amount
  accumDep: number,     // Accumulated depreciation
  nbv: number,          // Net book value
  depSchedule: object   // Monthly depreciation schedule
}
```

## Troubleshooting

### Firebase Connection Issues
If you see errors like "Permission denied on resource project", check:
1. Your environment variables are correctly set
2. The Firebase project ID is valid
3. Firestore is enabled in your Firebase project
4. Security rules allow read/write access

### Development Without Firebase
The application will work in development mode even without valid Firebase credentials, using sample data as a fallback.

### Production Deployment
Ensure your Vercel project has the Firebase environment variables configured before deploying to production.

### Security Rules
The default security rules allow public read/write access. For production, consider:
- Adding user authentication
- Restricting write access to authenticated users
- Adding data validation rules

## Next Steps

1. **Set up Firebase project** following the instructions above
2. **Configure environment variables** in both local and Vercel environments
3. **Test the application** with real Firebase credentials
4. **Deploy to production** with proper security rules
5. **Consider adding authentication** for enhanced security
