# Admin Dashboard

A comprehensive admin dashboard for Coder that integrates deprecation tracking and prepaid credits management.

## Features

### 1. System Overview Stats
- **Total Users**: Display count of all users in the system
- **Total Workspaces**: Display count of all workspaces
- **Active Templates**: Display count of non-deprecated templates
- **Deprecated Templates**: Display count of deprecated templates with warning styling

### 2. Deprecation Tracker

Builds upon the existing Coder deprecation system to provide:

- **Visual Overview**: Shows all deprecated templates in a clean, organized view
- **Template Details**: Displays template name, deprecation message, active user count, and deprecation date
- **Quick Actions**: Direct links to view template details and manage template settings
- **Status Indicators**: Clear visual indicators for deprecated status
- **Markdown Support**: Renders deprecation messages with full markdown support

#### Integration with Existing System

The deprecation tracker leverages Coder's existing deprecation infrastructure:
- Uses the `deprecated` and `deprecation_message` fields from the Template API
- Integrates with the existing notification system (`notifyUsersOfTemplateDeprecation`)
- Maintains compatibility with existing template management workflows
- Displays data from the same sources used by the template pages

### 3. Prepaids Module

A complete prepaid credits management system with:

#### Credit Pool Management
- **Create Credit Pools**: Form to create new prepaid credit pools with name, amount, expiration, and user limits
- **Pool Overview**: Visual summary of total, used, and remaining credits
- **Status Tracking**: Active, expired, and depleted status indicators

#### Credit Pool Features
- **Usage Tracking**: Visual progress bars showing credit consumption
- **User Assignment**: Track assigned vs. total users per pool
- **Expiration Management**: Display creation and expiration dates
- **Quick Actions**: Manage users and view detailed usage

#### Mock Data Structure
Currently uses mock data with the following structure:
```typescript
interface PrepaidCredit {
  id: string;
  name: string;
  amount: number;
  currency: string;
  usedAmount: number;
  status: 'active' | 'expired' | 'depleted';
  createdAt: string;
  expiresAt?: string;
  assignedUsers: number;
  totalUsers: number;
}
```

## File Structure

```
AdminDashboardPage/
├── AdminDashboardPage.tsx          # Main dashboard component
├── DashboardStats/
│   └── DashboardStats.tsx          # System overview statistics
├── DeprecationTracker/
│   └── DeprecationTracker.tsx      # Deprecation tracking interface
├── PrepaidsModule/
│   └── PrepaidsModule.tsx          # Prepaid credits management
└── README.md                       # This documentation
```

## Navigation Integration

The dashboard is accessible via:
- **URL**: `/admin`
- **Navigation**: Added "Admin" link to the main navigation bar
- **Route**: Integrated into the main React Router configuration

## Styling Approach

The dashboard uses:
- **Tailwind CSS**: For consistent styling with the rest of Coder
- **Lucide React Icons**: For consistent iconography
- **Existing Components**: Leverages Coder's existing component library (Button, Pill, Avatar, etc.)
- **Responsive Design**: Mobile-friendly grid layouts

## API Integration

### Current Integrations
- **Templates API**: Fetches template data including deprecation status
- **Workspaces API**: Gets workspace counts for statistics
- **Users API**: Gets user counts for statistics

### Future API Requirements
For the prepaids module to be fully functional, the following APIs would need to be implemented:
- `GET /api/v2/prepaids` - List prepaid credit pools
- `POST /api/v2/prepaids` - Create new credit pool
- `GET /api/v2/prepaids/{id}` - Get specific credit pool details
- `PUT /api/v2/prepaids/{id}` - Update credit pool
- `GET /api/v2/prepaids/{id}/usage` - Get usage statistics
- `POST /api/v2/prepaids/{id}/users` - Assign users to credit pool

## Next Steps

1. **Backend Implementation**: Implement the prepaid credits API endpoints
2. **Database Schema**: Design and implement prepaid credits database tables
3. **User Assignment**: Build user assignment interface for credit pools
4. **Usage Tracking**: Implement real-time usage tracking
5. **Billing Integration**: Connect with billing systems for credit consumption
6. **Permissions**: Add role-based access control for admin features
7. **Testing**: Add comprehensive unit and integration tests

## Usage

To access the admin dashboard:
1. Navigate to `/admin` in your Coder instance
2. View system statistics at the top
3. Review deprecated templates in the middle section
4. Manage prepaid credits in the bottom section

The dashboard provides a centralized location for administrators to monitor system health, manage template deprecations, and oversee prepaid credit allocation.
