# Coder Admin Dashboard - Installation Guide

## Quick Start

The admin dashboard has been successfully created and is ready for integration into your Coder instance.

## Repository Information

**Repository**: https://github.com/Chuckshub/Coder-Departments  
**Branch**: `admin-dashboard-feature`  
**Pull Request**: https://github.com/Chuckshub/Coder-Departments/pull/new/admin-dashboard-feature

## Files Created

### 1. Main Dashboard Components

```
AdminDashboardPage/
├── AdminDashboardPage.tsx              # Main dashboard page
├── DashboardStats/
│   └── DashboardStats.tsx              # System overview statistics
├── DeprecationTracker/
│   └── DeprecationTracker.tsx          # Deprecation management interface
├── PrepaidsModule/
│   └── PrepaidsModule.tsx              # Prepaid credits management
└── README.md                           # Detailed component documentation
```

### 2. Supporting Components

```
Card/
└── Card.tsx                            # Reusable card component
```

### 3. Integration Files

- `admin-dashboard.patch` - Git patch with routing and navigation changes
- `README.md` - Complete project documentation
- `INSTALLATION.md` - This installation guide

## Installation Steps

### Option 1: Apply to Existing Coder Instance

1. **Copy Component Files**:
   ```bash
   # Copy to your Coder repository
   cp -r AdminDashboardPage/ /path/to/coder/site/src/pages/
   cp -r Card/ /path/to/coder/site/src/components/
   ```

2. **Apply Integration Changes**:
   ```bash
   # Apply the routing and navigation patch
   cd /path/to/coder
   git apply admin-dashboard.patch
   ```

3. **Install Dependencies** (if needed):
   ```bash
   cd site
   npm install
   ```

4. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```

### Option 2: Manual Integration

If the patch doesn't apply cleanly, make these manual changes:

1. **Add Route** in `site/src/router.tsx`:
   ```typescript
   // Add import
   import AdminDashboardPage from "./pages/AdminDashboardPage/AdminDashboardPage";
   
   // Add route (after workspaces route)
   <Route path="/admin" element={<AdminDashboardPage />} />
   ```

2. **Add Navigation Link** in `site/src/modules/dashboard/Navbar/NavbarView.tsx`:
   ```typescript
   // Add after Templates NavLink
   <NavLink
       className={({ isActive }) => {
           return cn(linkStyles.default, isActive ? linkStyles.active : "");
       }}
       to="/admin"
   >
       Admin
   </NavLink>
   ```

## Features Overview

### 🔍 Deprecation Tracker
- **Visual Interface**: Clean display of all deprecated templates
- **Template Details**: Shows name, deprecation message, user count, dates
- **Quick Actions**: Direct links to template management
- **Markdown Support**: Renders deprecation messages with full markdown
- **Integration**: Uses existing Coder deprecation system

### 💳 Prepaids Module
- **Credit Pool Management**: Create and manage prepaid credit pools
- **Usage Tracking**: Visual progress bars for credit consumption
- **User Assignment**: Track assigned vs total users per pool
- **Status Management**: Active, expired, depleted indicators
- **Ready for Backend**: Structured for easy API integration

### 📊 System Overview
- **Real-time Stats**: User, workspace, and template counts
- **Visual Indicators**: Color-coded metrics with icons
- **Responsive Design**: Works on desktop and mobile

## API Requirements for Prepaids

To make the prepaids module fully functional, implement these backend endpoints:

```typescript
// Credit Pool Management
GET    /api/v2/prepaids              // List all credit pools
POST   /api/v2/prepaids              // Create new credit pool
GET    /api/v2/prepaids/{id}         // Get specific pool details
PUT    /api/v2/prepaids/{id}         // Update credit pool
DELETE /api/v2/prepaids/{id}         // Delete credit pool

// Usage and Assignment
GET    /api/v2/prepaids/{id}/usage   // Get usage statistics
POST   /api/v2/prepaids/{id}/users   // Assign users to pool
DELETE /api/v2/prepaids/{id}/users/{userId} // Remove user from pool
```

## Database Schema (Suggested)

```sql
-- Credit Pools Table
CREATE TABLE prepaid_credit_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    used_amount DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active', -- active, expired, depleted
    max_users INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- User Pool Assignments
CREATE TABLE prepaid_pool_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES prepaid_credit_pools(id),
    user_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(pool_id, user_id)
);

-- Usage Tracking
CREATE TABLE prepaid_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES prepaid_credit_pools(id),
    user_id UUID REFERENCES users(id),
    workspace_id UUID REFERENCES workspaces(id),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Access

Once installed, access the admin dashboard at:
**URL**: `https://your-coder-instance.com/admin`

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all Coder dependencies are installed
2. **Styling Issues**: Verify Tailwind CSS is configured
3. **Route Not Found**: Check that the route was added correctly
4. **Navigation Missing**: Verify the navbar changes were applied

### Development

For development and testing:
```bash
# Start development server
cd site
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## Support

The admin dashboard integrates seamlessly with Coder's existing:
- Authentication system
- Permission model
- API structure
- Design system
- Component library

All components follow Coder's established patterns for consistency and maintainability.
