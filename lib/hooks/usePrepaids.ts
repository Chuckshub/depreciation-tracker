import { useState, useCallback } from 'react';
import { PrepaidRecord, PrepaidFormData } from '@/types/ultimate-prepaid';

interface UsePrepaidsReturn {
  prepaids: PrepaidRecord[];
  loading: boolean;
  error: string | null;
  fetchPrepaids: () => Promise<void>;
  createPrepaid: (data: PrepaidFormData) => Promise<PrepaidRecord | null>;
  updatePrepaid: (data: Partial<PrepaidRecord> & { id: string }) => Promise<boolean>;
  deletePrepaid: (id: string) => Promise<boolean>;
  saveChanges: (prepaids: PrepaidRecord[]) => Promise<boolean>;
}

export function usePrepaids(): UsePrepaidsReturn {
  const [prepaids, setPrepaids] = useState<PrepaidRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrepaids = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prepaids?includeVendors=true');
      if (!response.ok) {
        throw new Error('Failed to fetch prepaids');
      }
      
      const data = await response.json();
      setPrepaids(data.prepaids || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPrepaid = useCallback(async (data: PrepaidFormData): Promise<PrepaidRecord | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prepaids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prepaid');
      }
      
      const newPrepaid = await response.json();
      setPrepaids(prev => [newPrepaid, ...prev]);
      return newPrepaid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrepaid = useCallback(async (data: Partial<PrepaidRecord> & { id: string }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prepaids', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prepaid');
      }
      
      // Update local state
      setPrepaids(prev => prev.map(prepaid => 
        prepaid.id === data.id ? { ...prepaid, ...data, updatedAt: new Date() } : prepaid
      ));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePrepaid = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/prepaids?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prepaid');
      }
      
      setPrepaids(prev => prev.filter(prepaid => prepaid.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveChanges = useCallback(async (updatedPrepaids: PrepaidRecord[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Find prepaids that have been modified (compare with current state)
      const modifiedPrepaids = updatedPrepaids.filter(updated => {
        const current = prepaids.find(p => p.id === updated.id);
        return current && JSON.stringify(current) !== JSON.stringify(updated);
      });

      // Update each modified prepaid
      const updatePromises = modifiedPrepaids.map(prepaid => 
        updatePrepaid({
          id: prepaid.id,
          description: prepaid.description,
          initialAmount: prepaid.initialAmount,
          startDate: prepaid.startDate,
          endDate: prepaid.endDate,
          termMonths: prepaid.termMonths,
          monthlyAmortization: prepaid.monthlyAmortization,
          currentBalance: prepaid.currentBalance,
          amortizationSchedule: prepaid.amortizationSchedule,
          glAccount: prepaid.glAccount,
          expenseAccount: prepaid.expenseAccount,
          isActive: prepaid.isActive,
          notes: prepaid.notes
        })
      );

      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every(result => result);
      
      if (allSuccessful) {
        setPrepaids(updatedPrepaids);
      }
      
      return allSuccessful;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [prepaids, updatePrepaid]);

  return {
    prepaids,
    loading,
    error,
    fetchPrepaids,
    createPrepaid,
    updatePrepaid,
    deletePrepaid,
    saveChanges
  };
}
