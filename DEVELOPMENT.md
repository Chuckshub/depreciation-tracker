# Development Setup

## Quick Start (Without Firebase)

For quick testing and development, you can run the app without Firebase:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Upload CSV files:**
   - The app will automatically detect that Firebase is not configured
   - It will use local browser storage instead
   - Your data will persist in the browser until you clear it

## Full Setup (With Firebase)

For production or full development with data persistence:

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database

2. **Get Firebase configuration:**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Web app" icon to create a web app
   - Copy the configuration values

3. **Create environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Update `.env.local` with your Firebase values:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
   ```

5. **Restart the development server:**
   ```bash
   npm run dev
   ```

## CSV Upload Issues

If you're experiencing upload issues:

1. **Check the browser console** for error messages
2. **Verify your CSV format** matches the expected structure
3. **Try the local storage mode** first (without Firebase)
4. **Check Firebase configuration** if using Firebase

## CSV Format Requirements

Your CSV should have these columns:
- `Date`, `Payee (Name)`, `Memo/Description`
- `Cost`, `# of life (months)`, `Monthly Dep`
- Monthly columns: `1/1/25`, `2/1/25`, `3/1/25`, etc.

**Important:** Make sure February column is `2/1/25` (not `1/2/25`)
