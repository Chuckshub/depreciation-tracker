"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '@/types/asset';
import { formatCurrency, get2025MonthKeys, getMonthName } from '@/utils/formatters';

type SortField = 'asset' | 'account' | 'department' | 'dateInPlace' | 'total' | string; // string for month keys
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function DepreciationHistoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'asset', direction: 'asc' });
  const router = useRouter();

  const monthKeys = get2025MonthKeys();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/assets');
        if (!response.ok) {
          throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both array format and object with assets property
        const assetArray = Array.isArray(data) ? data : data.assets || [];
        setAssets(assetArray);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load asset data';
        setError(errorMessage);
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Calculate depreciation amount for a specific month
  const getDepreciationForMonth = useCallback((asset: Asset, monthKey: string): number => {
    // Only use the value if it exists in the depreciation schedule
    // Don't fall back to monthlyDep as that would give incorrect totals
    return asset.depSchedule[monthKey] ?? 0;
  }, []);

  // Calculate total depreciation for an asset across all 2025 months
  const getTotalDepreciation = useCallback((asset: Asset): number => {
    return monthKeys.reduce((total, monthKey) => {
      return total + getDepreciationForMonth(asset, monthKey);
    }, 0);
  }, [monthKeys, getDepreciationForMonth]);

  // Calculate monthly totals across all assets
  const monthlyTotals = useMemo(() => {
    return monthKeys.map(monthKey => {
      return assets.reduce((total, asset) => {
        return total + getDepreciationForMonth(asset, monthKey);
      }, 0);
    });
  }, [assets, monthKeys, getDepreciationForMonth]);

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return monthlyTotals.reduce((sum, monthTotal) => sum + monthTotal, 0);
  }, [monthlyTotals]);

  // Sort assets based on current sort configuration
  const sortedAssets = useMemo(() => {
    const sorted = [...assets].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortConfig.field) {
        case 'asset':
          aValue = a.asset.toLowerCase();
          bValue = b.asset.toLowerCase();
          break;
        case 'account':
          aValue = a.account.toLowerCase();
          bValue = b.account.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'dateInPlace':
          aValue = new Date(a.dateInPlace).getTime();
          bValue = new Date(b.dateInPlace).getTime();
          break;
        case 'total':
          aValue = getTotalDepreciation(a);
          bValue = getTotalDepreciation(b);
          break;
        default:
          // Month column
          if (monthKeys.includes(sortConfig.field)) {
            aValue = getDepreciationForMonth(a, sortConfig.field);
            bValue = getDepreciationForMonth(b, sortConfig.field);
          } else {
            aValue = a.asset.toLowerCase();
            bValue = b.asset.toLowerCase();
          }
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [assets, sortConfig, monthKeys, getTotalDepreciation, getDepreciationForMonth]);

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const navigateToReconciliation = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-full mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading depreciation data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-full mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800 font-semibold mb-2">Error Loading Data</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">2025 Depreciation Rollforward</h1>
          <div className="flex gap-4">
            <button
              onClick={navigateToReconciliation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Reconciliation
            </button>
          </div>
        </div>

        {/* Rollforward Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100 sticky left-0 bg-gray-50 z-10"
                    onClick={() => handleSort('asset')}
                  >
                    Asset{getSortIcon('asset')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('account')}
                  >
                    Account{getSortIcon('account')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    Department{getSortIcon('department')}
                  </th>
                  <th 
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dateInPlace')}
                  >
                    Date in Place{getSortIcon('dateInPlace')}
                  </th>
                  {monthKeys.map((monthKey) => (
                    <th 
                      key={monthKey}
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100 min-w-[80px]"
                      onClick={() => handleSort(monthKey)}
                    >
                      {getMonthName(monthKey).replace(' 2025', '')}{getSortIcon(monthKey)}
                    </th>
                  ))}
                  <th 
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                    onClick={() => handleSort('total')}
                  >
                    Total{getSortIcon('total')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAssets.map((asset, index) => (
                  <tr key={asset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                      <div className="font-medium">{asset.asset}</div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {asset.account}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {asset.department}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {new Date(asset.dateInPlace).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    {monthKeys.map((monthKey) => {
                      const amount = getDepreciationForMonth(asset, monthKey);
                      return (
                        <td 
                          key={monthKey}
                          className="px-2 py-3 text-sm text-gray-900 border-r border-gray-200 text-right font-mono"
                        >
                          {formatCurrency(amount)}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-sm text-gray-900 text-right font-mono font-semibold">
                      {formatCurrency(getTotalDepreciation(asset))}
                    </td>
                  </tr>
                ))}
                
                {/* Monthly Total Row */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-blue-50 z-10">
                    Monthly Total
                  </td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  {monthlyTotals.map((monthTotal, index) => (
                    <td 
                      key={monthKeys[index]}
                      className="px-2 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 text-right font-mono"
                    >
                      {formatCurrency(monthTotal)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right font-mono">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600">
          Total Assets: {assets.length} | Total 2025 Depreciation: {formatCurrency(grandTotal)}
        </div>
      </div>
    </div>
  );
}
