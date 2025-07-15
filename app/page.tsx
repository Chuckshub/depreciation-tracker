"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '@/types/asset';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface AddAssetFormProps {
  onSubmit: (assetData: {
    asset: string;
    account: string;
    department: string;
    cost: number;
    lifeMonths: number;
    dateInPlace?: string;
  }) => Promise<{ success: boolean; asset: Asset; totalAssets: number }>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function AddAssetForm({ onSubmit, onCancel, isSubmitting }: AddAssetFormProps) {
  const [formData, setFormData] = useState({
    asset: '',
    account: '15003 - Computer Equipment',
    department: '',
    cost: '',
    lifeMonths: '36',
    dateInPlace: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({
        asset: formData.asset,
        account: formData.account,
        department: formData.department,
        cost: parseFloat(formData.cost),
        lifeMonths: parseInt(formData.lifeMonths),
        dateInPlace: new Date(formData.dateInPlace).toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Name
        </label>
        <input
          type="text"
          required
          value={formData.asset}
          onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., John Doe - MacBook Pro"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account
        </label>
        <input
          type="text"
          required
          value={formData.account}
          onChange={(e) => setFormData({ ...formData, account: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          type="text"
          required
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Research & Development : Engineering"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost ($)
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Life (Months)
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.lifeMonths}
            onChange={(e) => setFormData({ ...formData, lifeMonths: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date in Place
        </label>
        <input
          type="date"
          required
          value={formData.dateInPlace}
          onChange={(e) => setFormData({ ...formData, dateInPlace: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
}

export default function ReconciliationPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingAsset, setAddingAsset] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAssets();
  }, []);

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

  const addAsset = async (assetData: {
    asset: string;
    account: string;
    department: string;
    cost: number;
    lifeMonths: number;
    dateInPlace?: string;
  }) => {
    try {
      setAddingAsset(true);
      
      const response = await fetch('/api/add-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add asset');
      }
      
      const result = await response.json();
      
      // Refresh the assets list
      await fetchAssets();
      
      // Close the form
      setShowAddForm(false);
      
      return result;
    } catch (err) {
      console.error('Error adding asset:', err);
      throw err;
    } finally {
      setAddingAsset(false);
    }
  };

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
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Asset
            </button>
            <button
              onClick={navigateToRollforward}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Depreciation History
            </button>
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Asset</h2>
              <AddAssetForm 
                onSubmit={addAsset} 
                onCancel={() => setShowAddForm(false)}
                isSubmitting={addingAsset}
              />
            </div>
          </div>
        )}

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
