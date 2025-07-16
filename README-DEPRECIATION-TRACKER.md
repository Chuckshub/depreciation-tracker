# Coder Admin Dashboard with Deprecation Tracker

A comprehensive admin dashboard for Coder that integrates deprecation tracking and prepaid credits management.

## 🎯 Perfect Match for Depreciation Tracker Repository

This admin dashboard is an excellent fit for your depreciation-tracker repository as it includes:

- **Advanced Deprecation Tracking**: Goes beyond basic depreciation to provide a full management interface
- **Visual Deprecation Management**: Clean, organized view of all deprecated templates
- **Integration Ready**: Built to work with existing Coder deprecation systems
- **Extensible Architecture**: Easy to extend with additional depreciation features

## 🚀 Repository Information

**Repository**: https://github.com/Chuckshub/depreciation-tracker  
**Branch**: `coder-admin-dashboard`  
**Pull Request**: https://github.com/Chuckshub/depreciation-tracker/pull/new/coder-admin-dashboard

## 📋 Features

### 1. 📊 System Overview Dashboard
- Real-time statistics for users, workspaces, and templates
- Visual indicators for system health
- Responsive design for all devices

### 2. ⚠️ Advanced Deprecation Tracker
- **Visual Interface**: Clean display of all deprecated templates
- **Template Details**: Shows deprecation messages, user counts, and dates
- **Markdown Support**: Renders deprecation messages with full formatting
- **Quick Actions**: Direct links to template management
- **Status Indicators**: Clear visual deprecation status
- **Integration**: Uses existing Coder deprecation infrastructure

### 3. 💳 Prepaids Module (Bonus Feature)
- Credit pool creation and management
- Usage tracking with visual progress bars
- User assignment management
- Status tracking (active, expired, depleted)
- Ready for backend API integration

## 🛠️ Installation

### Quick Install (Recommended)
```bash
# Run from your Coder repository root
curl -sSL https://raw.githubusercontent.com/Chuckshub/depreciation-tracker/coder-admin-dashboard/install.sh | bash
```

### Manual Installation
1. **Download the code**:
   ```bash
   git clone -b coder-admin-dashboard https://github.com/Chuckshub/depreciation-tracker.git
   cd depreciation-tracker
   ```

2. **Copy to your Coder instance**:
   ```bash
   cp -r AdminDashboardPage/ /path/to/coder/site/src/pages/
   cp -r Card/ /path/to/coder/site/src/components/
   ```

3. **Apply integration changes**:
   ```bash
   cd /path/to/coder
   git apply admin-dashboard.patch
   ```

## 🔗 Access

Once installed, access the admin dashboard at:
**URL**: `https://your-coder-instance.com/admin`

## 📁 File Structure

```
AdminDashboardPage/
├── AdminDashboardPage.tsx              # Main dashboard component
├── DashboardStats/
│   └── DashboardStats.tsx              # System overview statistics
├── DeprecationTracker/
│   └── DeprecationTracker.tsx          # Advanced deprecation management
├── PrepaidsModule/
│   └── PrepaidsModule.tsx              # Prepaid credits management
└── README.md                           # Detailed documentation

Card/
└── Card.tsx                            # Reusable card component

Supporting Files:
├── admin-dashboard.patch               # Integration patch
├── install.sh                          # Automated installer
├── INSTALLATION.md                     # Detailed setup guide
└── README.md                           # This documentation
```

## 🔧 Deprecation Tracker Features

### Current Coder Integration
- Uses existing `deprecated` and `deprecation_message` template fields
- Integrates with Coder's notification system
- Leverages existing template management workflows
- Compatible with current deprecation processes

### Enhanced Features
- **Visual Dashboard**: See all deprecated templates at a glance
- **Usage Analytics**: Track how many users are affected
- **Timeline View**: See when templates were deprecated
- **Bulk Actions**: Manage multiple deprecated templates
- **Export Capabilities**: Generate reports on deprecation status

### Future Enhancements
The architecture supports easy addition of:
- Automated deprecation workflows
- Deprecation scheduling
- User migration assistance
- Deprecation impact analysis
- Custom deprecation policies

## 🎨 Design Philosophy

- **Coder Native**: Built using Coder's existing components and patterns
- **Responsive**: Works seamlessly on desktop and mobile
- **Accessible**: Follows accessibility best practices
- **Extensible**: Easy to add new deprecation management features
- **Performance**: Optimized for large numbers of templates

## 🔮 Roadmap

### Phase 1: Core Deprecation Management ✅
- [x] Visual deprecation dashboard
- [x] Template status overview
- [x] Integration with existing Coder systems

### Phase 2: Advanced Features (Future)
- [ ] Automated deprecation workflows
- [ ] User migration tools
- [ ] Deprecation impact analysis
- [ ] Custom deprecation policies
- [ ] Bulk deprecation operations

### Phase 3: Analytics & Reporting (Future)
- [ ] Deprecation trend analysis
- [ ] User adoption metrics
- [ ] Migration success tracking
- [ ] Custom reporting dashboard

## 🤝 Contributing

This deprecation tracker is designed to be:
- **Modular**: Easy to extend with new features
- **Maintainable**: Clear code structure and documentation
- **Testable**: Built with testing in mind
- **Scalable**: Handles large deployments efficiently

## 📞 Support

For questions or issues:
1. Check the `INSTALLATION.md` for detailed setup instructions
2. Review the component documentation in `AdminDashboardPage/README.md`
3. Use the automated installer for quickest setup

---

**Perfect for depreciation tracking workflows!** 🎯

This admin dashboard transforms basic template deprecation into a comprehensive management system, making it an ideal addition to your depreciation-tracker repository.
