#!/bin/bash

# Coder Admin Dashboard Installation Script
# This script helps install the admin dashboard into an existing Coder instance

set -e

echo "🚀 Coder Admin Dashboard Installation"
echo "====================================="

# Check if we're in a Coder repository
if [ ! -f "site/package.json" ]; then
    echo "❌ Error: This script must be run from the root of a Coder repository"
    echo "   Make sure you're in the directory containing the 'site' folder"
    exit 1
fi

echo "✅ Found Coder repository structure"

# Create backup
echo "📦 Creating backup of existing files..."
mkdir -p .admin-dashboard-backup
cp -r site/src/router.tsx .admin-dashboard-backup/ 2>/dev/null || true
cp -r site/src/modules/dashboard/Navbar/NavbarView.tsx .admin-dashboard-backup/ 2>/dev/null || true

echo "📥 Downloading admin dashboard files..."

# Download the admin dashboard files
curl -L -o admin-dashboard.tar.gz "https://github.com/Chuckshub/Coder-Departments/archive/refs/heads/admin-dashboard-feature.tar.gz"

echo "📂 Extracting files..."
tar -xzf admin-dashboard.tar.gz
cd Coder-Departments-admin-dashboard-feature

echo "📋 Installing admin dashboard components..."

# Copy the admin dashboard components
cp -r AdminDashboardPage/ ../site/src/pages/
cp -r Card/ ../site/src/components/

echo "🔧 Applying integration changes..."

# Try to apply the patch
if git apply admin-dashboard.patch 2>/dev/null; then
    echo "✅ Successfully applied integration patch"
else
    echo "⚠️  Patch failed to apply automatically. Manual integration required."
    echo "   Please see INSTALLATION.md for manual integration steps."
    cp admin-dashboard.patch ../
    cp INSTALLATION.md ../
fi

# Cleanup
cd ..
rm -rf admin-dashboard.tar.gz Coder-Departments-admin-dashboard-feature

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes in your git status"
echo "2. Install dependencies: cd site && npm install"
echo "3. Start development server: npm run dev"
echo "4. Visit http://localhost:3000/admin to see the dashboard"
echo ""
echo "📚 For manual integration or troubleshooting, see INSTALLATION.md"
echo "🔄 To restore backups if needed, check .admin-dashboard-backup/"
