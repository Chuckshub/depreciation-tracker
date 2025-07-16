"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Asset, AssetType } from '@/types/asset';
import { formatCurrency, get2025MonthKeys, getMonthName } from '@/utils/formatters';

interface EditableGLCellProps {
  value: number;
  monthKey: string;
  isEditing: boolean;
  onEdit: (monthKey: string) => void;
  onSave: (monthKey: string, value: string) => void;
  onCancel: () => void;
}

function EditableGLCell({ value, monthKey, isEditing, onEdit, onSave, onCancel }: EditableGLCellProps) {
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setEditValue(value.toString());
    onEdit(monthKey);
  };

  const handleSave = () => {
    onSave(monthKey, editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        autoFocus
        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right font-mono"
        step="0.01"
      />
    );
  }

  return (
    <div 
      onClick={handleEdit}
      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors text-right font-mono"
      title="Click to edit GL balance"
    >
      {formatCurrency(value)}
    </div>
  );
}

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
  const [glBalances, setGlBalances] = useState<Record<string, number>>({});
  const [editingGlCell, setEditingGlCell] = useState<string | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [selectedJEMonth, setSelectedJEMonth] = useState<string>('');
  const [downloadingJE, setDownloadingJE] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetType>('computer-equipment');
  const router = useRouter();

  const monthKeys = get2025MonthKeys();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch assets and GL balances in parallel
        const [assetsResponse, glBalancesResponse] = await Promise.all([
          fetch(`/api/assets?assetType=${activeTab}`),
          fetch('/api/gl-balances')
        ]);
        
        if (!assetsResponse.ok) {
          throw new Error(`Failed to fetch assets: ${assetsResponse.status} ${assetsResponse.statusText}`);
        }
        
        const assetsData = await assetsResponse.json();
        const assetArray = Array.isArray(assetsData) ? assetsData : assetsData.assets || [];
        setAssets(assetArray);
        
        // Load GL balances if available
        if (glBalancesResponse.ok) {
          const glData = await glBalancesResponse.json();
          if (glData.success && glData.glBalances) {
            setGlBalances(glData.glBalances);
          }
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

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

  // Calculate variance for each month (GL Balance - Calculated Balance)
  const monthlyVariances = useMemo(() => {
    return monthKeys.map((monthKey, index) => {
      const glBalance = glBalances[monthKey] || 0;
      const calculatedBalance = monthlyTotals[index] || 0;
      return glBalance - calculatedBalance;
    });
  }, [monthKeys, glBalances, monthlyTotals]);

  // Handle GL balance editing
  const handleGlBalanceEdit = (monthKey: string) => {
    setEditingGlCell(monthKey);
  };

  const handleGlBalanceSave = (monthKey: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGlBalances(prev => ({ ...prev, [monthKey]: numValue }));
    setEditingGlCell(null);
  };

  const handleGlBalanceCancel = () => {
    setEditingGlCell(null);
  };

  const handleDownloadReconciliation = async () => {
    setDownloadingExcel(true);
    try {
      // Save GL balances first
      await fetch('/api/gl-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ glBalances }),
      });

      // Prepare data for Excel export
      const exportData = {
        assets: sortedAssets,
        monthKeys,
        monthlyTotals,
        glBalances,
        monthlyVariances,
        grandTotal
      };

      // Generate Excel file
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `depreciation-reconciliation-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading reconciliation:', error);
      setError(error instanceof Error ? error.message : 'Failed to download reconciliation');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadJournalEntry = async () => {
    if (!selectedJEMonth) {
      alert('Please select a month for the journal entry.');
      return;
    }

    setDownloadingJE(true);
    try {
      const response = await fetch('/api/export/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: sortedAssets,
          selectedMonth: selectedJEMonth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Journal Entry export');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `journal-entry-${selectedJEMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading journal entry:', error);
      setError(error instanceof Error ? error.message : 'Failed to download journal entry');
    } finally {
      setDownloadingJE(false);
    }
  };

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
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('computer-equipment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'computer-equipment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Computer Equipment
              </button>
              <button
                onClick={() => setActiveTab('furniture')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'furniture'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Furniture
              </button>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            2025 {activeTab === 'computer-equipment' ? 'Computer Equipment' : 'Furniture'} Depreciation Rollforward
          </h1>
          <div className="flex gap-4">
            <button
              onClick={navigateToReconciliation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Reconciliation
            </button>
            <button
              onClick={handleDownloadReconciliation}
              disabled={downloadingExcel}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                downloadingExcel 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {downloadingExcel ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Excel...
                </span>
              ) : (
                <span className="flex items-center">
                  📊 Download Reconciliation
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <select
                value={selectedJEMonth}
                onChange={(e) => setSelectedJEMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Month for JE</option>
                {monthKeys.map(monthKey => {
                  const date = new Date(monthKey);
                  const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={monthKey} value={monthKey}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={handleDownloadJournalEntry}
                disabled={downloadingJE || !selectedJEMonth}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  downloadingJE || !selectedJEMonth
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {downloadingJE ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating JE...
                  </span>
                ) : (
                  <span className="flex items-center">
                    📝 Download Journal Entry
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                GL Balance & Reconciliation
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Click on <strong>GL Balance</strong> cells to enter actual GL amounts. <strong>Variance</strong> shows the difference (GL - Calculated). Use <strong>Download Reconciliation</strong> to save GL balances and export to Excel with journal entries.</p>
              </div>
            </div>
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

                {/* GL Balance Row */}
                <tr className="bg-green-50 border-t border-green-200">
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-green-50 z-10">
                    GL Balance
                  </td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  {monthKeys.map((monthKey) => (
                    <td 
                      key={`gl-${monthKey}`}
                      className="px-2 py-3 text-sm text-gray-900 border-r border-gray-200"
                    >
                      <EditableGLCell
                        value={glBalances[monthKey] || 0}
                        monthKey={monthKey}
                        isEditing={editingGlCell === monthKey}
                        onEdit={handleGlBalanceEdit}
                        onSave={handleGlBalanceSave}
                        onCancel={handleGlBalanceCancel}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right font-mono">
                    {formatCurrency(Object.values(glBalances).reduce((sum, val) => sum + val, 0))}
                  </td>
                </tr>

                {/* Variance Row */}
                <tr className="bg-yellow-50 border-t border-yellow-200">
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-yellow-50 z-10">
                    Variance
                  </td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  <td className="px-3 py-3 border-r border-gray-200"></td>
                  {monthlyVariances.map((variance, index) => (
                    <td 
                      key={`variance-${monthKeys[index]}`}
                      className={`px-2 py-3 text-sm font-bold border-r border-gray-200 text-right font-mono ${
                        variance > 0 ? 'text-green-700' : variance < 0 ? 'text-red-700' : 'text-gray-900'
                      }`}
                    >
                      {formatCurrency(variance)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-sm font-bold text-gray-900 text-right font-mono">
                    {formatCurrency(monthlyVariances.reduce((sum, variance) => sum + variance, 0))}
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
