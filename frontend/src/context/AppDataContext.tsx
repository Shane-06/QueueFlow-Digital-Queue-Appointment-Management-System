import React, { createContext, useContext, useState, useCallback } from 'react';
import { resetToInitialSeeds } from '../services/storage';
import { useToast } from './ToastContext';

interface AppDataContextType {
  dataVersion: number;
  triggerRefresh: () => void;
  resetAllDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataVersion, setDataVersion] = useState<number>(0);
  const { showToast } = useToast();

  const triggerRefresh = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  const resetAllDemoData = useCallback(() => {
    resetToInitialSeeds();
    setDataVersion((v) => v + 1);
    showToast('Prototype data successfully reset to initial university seeds.', 'success', 'System Reset');
  }, [showToast]);

  return (
    <AppDataContext.Provider value={{ dataVersion, triggerRefresh, resetAllDemoData }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
};
