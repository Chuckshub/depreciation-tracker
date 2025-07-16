# Coder Admin Dashboard

A comprehensive admin dashboard for Coder that integrates deprecation tracking and prepaid credits management.

## Overview

This repository contains the admin dashboard components built for Coder, featuring:

- **Deprecation Tracker**: Visual interface for managing deprecated templates
- **Prepaids Module**: Credit pool management system (ready for backend integration)
- **System Stats**: Overview of users, workspaces, and templates

## Installation

To integrate this admin dashboard into your Coder instance:

1. Copy the `AdminDashboardPage/` directory to `site/src/pages/`
2. Copy the `Card/` directory to `site/src/components/`
3. Apply the routing and navigation changes using the provided patch:
   ```bash
   git apply admin-dashboard.patch
   ```

## Files Included

- `AdminDashboardPage/` - Main dashboard components
- `Card/` - Reusable card component
- `admin-dashboard.patch` - Git patch with routing and navigation changes

## Features

### Deprecation Tracker
- Integrates with existing Coder deprecation system
- Visual display of deprecated templates
- Shows deprecation messages, user counts, and dates
- Quick actions for template management

### Prepaids Module
- Credit pool creation and management
- Usage tracking with visual progress bars
- User assignment tracking
- Status indicators (active, expired, depleted)

### System Overview
- Real-time statistics display
- User, workspace, and template counts
- Clean, responsive design

## Technical Details

- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Integrates with existing Coder components
- Responsive design for mobile and desktop
- Modular component architecture

## Next Steps

For the prepaids module to be fully functional, implement these backend APIs:
- `GET /api/v2/prepaids` - List credit pools
- `POST /api/v2/prepaids` - Create credit pool
- `GET /api/v2/prepaids/{id}` - Get pool details
- `PUT /api/v2/prepaids/{id}` - Update pool
- `GET /api/v2/prepaids/{id}/usage` - Usage statistics

## Access

Once installed, the admin dashboard is accessible at `/admin` in your Coder instance.

## Contributing

This dashboard was built to integrate seamlessly with Coder's existing architecture and design patterns. All components follow Coder's established conventions for maintainability and consistency.
