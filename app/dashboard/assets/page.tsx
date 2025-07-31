"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Asset } from '@/types/asset';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface EditableCellProps {
  value: string | number;
  assetId: string;
  field: string;
  type: 'date' | 'number';
  isEditing: boolean;
  isModified: boolean;
  onEdit: (assetId: string, field: string) => void;
  onSave: (assetId: string, field: string, value: string) => void;
  onCancel: () => void;
}

function EditableCell({ value, assetId, field, type, isEditing, isModified, onEdit, onSave, onCancel }: EditableCellProps) {
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    if (type === 'date') {
      // Convert ISO string to YYYY-MM-DD format for date input
      const date = new Date(value as string);
      setEditValue(date.toISOString().split('T')[0]);
    } else {
      setEditValue(value.toString());
    }
    onEdit(assetId, field);
  };

  const handleSave = () => {
    onSave(assetId, field, editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const displayValue = type === 'date' ? formatDate(value as string) : value;

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type={type === 'date' ? 'date' : 'number'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={type === 'number' ? '1' : undefined}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={handleEdit}
      className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors ${
        isModified ? 'bg-yellow-50 border border-yellow-300' : ''
      }`}
      title="Click to edit"
    >
      {displayValue}
      {isModified && (
        <span className="ml-2 text-xs text-yellow-600">●</span>
      )}
    </div>
  );
}

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
  const [editingCell, setEditingCell] = useState<{assetId: string, field: string} | null>(null);
  const [modifiedAssets, setModifiedAssets] = useState<Set<string>>(new Set());
  const [savingChanges, setSavingChanges] = useState(false);
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
      const assetArray = Array.isArray(data) ? data : (data?.assets || []);
      // Ensure we always have an array
      setAssets(Array.isArray(assetArray) ? assetArray : []);
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

  const updateAsset = (assetId: string, field: string, value: string) => {
    setAssets(prevAssets => 
      prevAssets.map(asset => {
        if (asset.id === assetId) {
          const updatedAsset = { ...asset };
          
          if (field === 'dateInPlace') {
            updatedAsset.dateInPlace = new Date(value).toISOString();
          } else if (field === 'lifeMonths') {
            const newLifeMonths = parseInt(value);
            if (!isNaN(newLifeMonths) && newLifeMonths > 0) {
              updatedAsset.lifeMonths = newLifeMonths;
              // Recalculate monthly depreciation
              updatedAsset.monthlyDep = updatedAsset.cost / newLifeMonths;
            }
          }
          
          // Mark asset as modified
          setModifiedAssets(prev => new Set(prev).add(assetId));
          return updatedAsset;
        }
        return asset;
      })
    );
  };

  const saveChangesToFirebase = async () => {
    if (modifiedAssets.size === 0) {
      router.push('/depreciation-history');
      return;
    }

    setSavingChanges(true);
    try {
      const modifiedAssetsList = assets.filter(asset => modifiedAssets.has(asset.id));
      
      // Save each modified asset
      for (const asset of modifiedAssetsList) {
        const response = await fetch('/api/assets/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(asset),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update asset: ${asset.asset}`);
        }
      }
      
      // Clear modified assets after successful save
      setModifiedAssets(new Set());
      
      // Navigate to depreciation history
      router.push('/depreciation-history');
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleEditCell = (assetId: string, field: string) => {
    setEditingCell({ assetId, field });
  };

  const handleSaveCell = (assetId: string, field: string, value: string) => {
    updateAsset(assetId, field, value);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const navigateToRollforward = () => {
    saveChangesToFirebase();
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
    <DashboardLayout title="Asset Management" subtitle="Manage and reconcile your asset portfolio">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Asset
            </button>
            <Link
              href="/upload"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
            >
              📁 Upload CSV
            </Link>
            <button
              onClick={navigateToRollforward}
              disabled={savingChanges}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                savingChanges 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {savingChanges ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </span>
              ) : (
                <span>
                  View Depreciation History
                  {modifiedAssets.size > 0 && (
                    <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {modifiedAssets.size} change{modifiedAssets.size !== 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              )}
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
                Editable Fields
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Click on <strong>Date in Place</strong> or <strong>Life (Months)</strong> to edit values. Changes are highlighted in yellow and will be saved when you click &quot;View Depreciation History&quot;.</p>
              </div>
            </div>
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
                {(assets || []).map((asset, index) => (
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
                      <EditableCell
                        value={asset.dateInPlace}
                        assetId={asset.id}
                        field="dateInPlace"
                        type="date"
                        isEditing={editingCell?.assetId === asset.id && editingCell?.field === 'dateInPlace'}
                        isModified={modifiedAssets.has(asset.id)}
                        onEdit={handleEditCell}
                        onSave={handleSaveCell}
                        onCancel={handleCancelEdit}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 text-center">
                      <EditableCell
                        value={asset.lifeMonths}
                        assetId={asset.id}
                        field="lifeMonths"
                        type="number"
                        isEditing={editingCell?.assetId === asset.id && editingCell?.field === 'lifeMonths'}
                        isModified={modifiedAssets.has(asset.id)}
                        onEdit={handleEditCell}
                        onSave={handleSaveCell}
                        onCancel={handleCancelEdit}
                      />
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
    </DashboardLayout>
  );
}
