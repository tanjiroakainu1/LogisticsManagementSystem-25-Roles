import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { AppData } from '@/types';
import { loadData, saveData, resetData, subscribeData, exportData, STORAGE_KEY } from '@/lib/store';

interface DataContextValue {
  data: AppData;
  refresh: () => void;
  update: (fn: (d: AppData) => void) => void;
  mutate: <T>(fn: (d: AppData) => T) => T;
  reset: () => void;
  exportJson: () => string;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  const syncFromStorage = useCallback(() => {
    setData({ ...loadData() });
  }, []);

  useEffect(() => {
    const unsub = subscribeData(syncFromStorage);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, [syncFromStorage]);

  const update = useCallback((fn: (d: AppData) => void) => {
    const d = loadData();
    fn(d);
    saveData(d);
    setData({ ...d });
  }, []);

  const mutate = useCallback(<T,>(fn: (d: AppData) => T): T => {
    const d = loadData();
    const result = fn(d);
    saveData(d);
    setData({ ...d });
    return result;
  }, []);

  const refresh = useCallback(() => syncFromStorage(), [syncFromStorage]);

  const reset = useCallback(() => {
    const d = resetData();
    setData({ ...d });
  }, []);

  return (
    <DataContext.Provider value={{ data, refresh, update, mutate, reset, exportJson: exportData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
