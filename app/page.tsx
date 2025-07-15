"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '@/types/asset';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function ReconciliationPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/depreciation_prod.json');
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

  const navigateToRollforward = () => {
    router.push('/depreciation-history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading asset data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Asset Reconciliation</h1>
          <div className="flex gap-4">
            <button
              onClick={navigateToRollforward}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Depreciation History
            </button>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Asset
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Date in Place
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Life (Months)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Monthly Dep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Accum Dep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NBV
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset, index) => (
                  <tr key={asset.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      <div className="font-medium">{asset.asset}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {asset.account} • {asset.department}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 font-mono">
                      {formatCurrency(asset.cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {formatDate(asset.dateInPlace)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 text-center">
                      {asset.lifeMonths}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 font-mono">
                      {formatCurrency(asset.monthlyDep)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 font-mono">
                      {formatCurrency(asset.accumDep)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {formatCurrency(asset.nbv)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600">
          Total Assets: {assets.length}
        </div>
      </div>
    </div>
  );
}
