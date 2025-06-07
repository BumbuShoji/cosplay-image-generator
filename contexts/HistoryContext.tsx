
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { HistoryEntry } from '../types';
import { MAX_HISTORY_ITEMS } from '../constants';

interface HistoryContextType {
  history: HistoryEntry[];
  addImageToHistory: (image: HistoryEntry) => void;
  deleteImageFromHistory: (id: string) => void;
  clearHistory: () => void;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const LOCAL_STORAGE_HISTORY_KEY = 'cosplayAppHistory';

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
        console.error("Failed to load history from localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorageHistory = (updatedHistory: HistoryEntry[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Failed to save history to localStorage:", error);
    }
  };

  const addImageToHistory = useCallback((image: HistoryEntry) => {
    setHistory(prevHistory => {
      const newHistory = [image, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
      updateLocalStorageHistory(newHistory);
      return newHistory;
    });
  }, []);

  const deleteImageFromHistory = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      updateLocalStorageHistory(newHistory);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    updateLocalStorageHistory([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, addImageToHistory, deleteImageFromHistory, clearHistory, isLoading }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
