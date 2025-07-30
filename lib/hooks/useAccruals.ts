import { useState, useCallback } from 'react';
import { Accrual, CreateAccrualRequest, UpdateAccrualRequest } from '@/types/accrual';

interface UseAccrualsReturn {
  accruals: Accrual[];
  loading: boolean;
  error: string | null;
  fetchAccruals: () => Promise<void>;
  createAccrual: (data: CreateAccrualRequest) => Promise<Accrual | null>;
  updateAccrual: (data: UpdateAccrualRequest) => Promise<boolean>;
  deleteAccrual: (id: string) => Promise<boolean>;
  saveChanges: (accruals: Accrual[]) => Promise<boolean>;
}

export function useAccruals(): UseAccrualsReturn {
  const [accruals, setAccruals] = useState<Accrual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccruals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/accruals');
      if (!response.ok) {
        throw new Error('Failed to fetch accruals');
      }
      
      const data = await response.json();
      setAccruals(data.accruals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccrual = useCallback(async (data: CreateAccrualRequest): Promise<Accrual | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/accruals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create accrual');
      }
      
      const newAccrual = await response.json();
      setAccruals(prev => [newAccrual, ...prev]);
      return newAccrual;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccrual = useCallback(async (data: UpdateAccrualRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/accruals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update accrual');
      }
      
      // Update local state
      setAccruals(prev => prev.map(accrual => 
        accrual.id === data.id ? { ...accrual, ...data, updatedAt: new Date() } : accrual
      ));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccrual = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/accruals?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete accrual');
      }
      
      setAccruals(prev => prev.filter(accrual => accrual.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveChanges = useCallback(async (updatedAccruals: Accrual[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Find accruals that have been modified (compare with current state)
      const modifiedAccruals = updatedAccruals.filter(updated => {
        const current = accruals.find(a => a.id === updated.id);
        return current && JSON.stringify(current) !== JSON.stringify(updated);
      });

      // Update each modified accrual
      const updatePromises = modifiedAccruals.map(accrual => 
        updateAccrual({
          id: accrual.id,
          vendor: accrual.vendor,
          description: accrual.description,
          accrualJEAccountDR: accrual.accrualJEAccountDR,
          accrualJEAccountCR: accrual.accrualJEAccountCR,
          balance: accrual.balance,
          monthlyEntries: accrual.monthlyEntries,
          notes: accrual.notes,
          isActive: accrual.isActive
        })
      );

      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every(result => result);
      
      if (allSuccessful) {
        setAccruals(updatedAccruals);
      }
      
      return allSuccessful;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [accruals, updateAccrual]);

  return {
    accruals,
    loading,
    error,
    fetchAccruals,
    createAccrual,
    updateAccrual,
    deleteAccrual,
    saveChanges
  };
}
