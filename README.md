# Depreciation Tracker

A Next.js 14 application for tracking asset depreciation with reconciliation and rollforward reporting capabilities.

## Features

### 📊 Reconciliation Page
- View all assets with their current depreciation status
- Display asset details: cost, date in place, life, monthly depreciation, accumulated depreciation, and net book value
- Clean, responsive table layout with Tailwind CSS styling
- Error handling for data loading issues

### 📈 Rollforward Page
- 2025 Depreciation Rollforward with monthly breakdown
- Interactive sorting by any column (asset, account, department, date, months, or total)
- Smart depreciation calculation using custom schedules or monthly defaults
- Monthly totals footer with grand total
- Sticky first column for better navigation on wide tables
- Currency formatting for all monetary values

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Data Format**: JSON

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Chuckshub/depreciation-tracker.git
cd depreciation-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Data Structure

The application expects a JSON file at `/public/depreciation_prod.json` with the following structure:

```json
[
  {
    "id": "asset-001",
    "asset": "Asset Name",
    "dateInPlace": "2023-01-15T00:00:00.000Z",
    "account": "1200-Computer Equipment",
    "department": "IT Department",
    "cost": 1200.00,
    "lifeMonths": 36,
    "monthlyDep": 33.33,
    "accumDep": 799.92,
    "nbv": 400.08,
    "depSchedule": {
      "01/01/2025": 33.33,
      "02/01/2025": 33.33,
      // ... monthly depreciation amounts
    }
  }
]
```

## Project Structure

```
depreciation-app/
├── app/
│   ├── page.tsx                    # Reconciliation page
│   ├── depreciation-history/
│   │   └── page.tsx               # Rollforward page
│   ├── globals.css                # Global styles
│   └── layout.tsx                 # Root layout
├── types/
│   └── asset.ts                   # TypeScript interfaces
├── utils/
│   └── formatters.ts              # Utility functions
├── public/
│   └── depreciation_prod.json     # Sample asset data
└── README.md
```

## Usage

### Navigation
- **Reconciliation Page**: Main landing page showing all assets
- **Rollforward Page**: Click "View Depreciation History" to see 2025 monthly breakdown
- **Back Navigation**: Use "Back to Reconciliation" button to return

### Sorting (Rollforward Page)
- Click any column header to sort by that field
- Click again to reverse sort direction
- Sort indicators (▲/▼) show current sort direction
- Sortable columns: Asset, Account, Department, Date in Place, all months, and Total

### Data Features
- **Currency Formatting**: All monetary values display as US currency
- **Date Formatting**: Dates show in human-readable format
- **Smart Depreciation**: Uses custom schedule when available, falls back to monthly amount
- **Error Handling**: Graceful error messages for data loading issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Sample Data

The application includes sample data with 6 different asset types:
- Computer equipment (Dell OptiPlex, MacBook Pro)
- Office equipment (HP Printer)
- Vehicles (Ford Transit Van)
- Furniture (Conference room set)
- Manufacturing equipment (3D Printer)

Each asset demonstrates different depreciation schedules and departmental assignments.
