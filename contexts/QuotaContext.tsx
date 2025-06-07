
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Quota } from '../types';
import { INITIAL_FREE_GENERATIONS, PREMIUM_GENERATIONS_LIMIT } from '../constants';
import { useAuth } from './AuthContext'; // Import useAuth

interface QuotaContextType {
  quota: Quota;
  canGenerate: () => boolean;
  incrementUsage: () => void;
  isLoadingQuota: boolean;
  upgradeToPremium: () => void; // New function for subscription
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

const LOCAL_STORAGE_QUOTA_PREFIX = 'cosplayAppQuota_';

export const QuotaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAuth(); // Get current user
  const [quota, setQuota] = useState<Quota>({
    used: 0,
    limit: INITIAL_FREE_GENERATIONS,
    isSubscribed: false,
  });
  const [isLoadingQuota, setIsLoadingQuota] = useState<boolean>(true);

  const getQuotaKey = useCallback(() => {
    return currentUser ? `${LOCAL_STORAGE_QUOTA_PREFIX}${currentUser.id}` : null;
  }, [currentUser]);

  useEffect(() => {
    if (isLoadingAuth) {
        setIsLoadingQuota(true);
        return;
    }

    const quotaKey = getQuotaKey();
    if (!quotaKey) { // No user logged in
      setQuota({ used: 0, limit: INITIAL_FREE_GENERATIONS, isSubscribed: false }); // Default non-user state or disable
      setIsLoadingQuota(false);
      return;
    }

    setIsLoadingQuota(true);
    try {
      const storedQuota = localStorage.getItem(quotaKey);
      if (storedQuota) {
        let parsedQuota: Quota = JSON.parse(storedQuota);

        // Simple client-side check for "monthly" reset for subscribed users
        if (parsedQuota.isSubscribed && parsedQuota.subscriptionDate) {
          const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - parsedQuota.subscriptionDate > thirtyDaysInMillis) {
            parsedQuota.used = 0; // Reset usage
            parsedQuota.subscriptionDate = Date.now(); // "Renew" subscription date
            // Persist this reset
            localStorage.setItem(quotaKey, JSON.stringify(parsedQuota));
          }
        }
        
        // Ensure limit is correct based on subscription status
        const expectedLimit = parsedQuota.isSubscribed ? PREMIUM_GENERATIONS_LIMIT : INITIAL_FREE_GENERATIONS;
        parsedQuota.limit = Math.max(expectedLimit, INITIAL_FREE_GENERATIONS);


        setQuota(parsedQuota);
      } else {
        // Set initial quota for the logged-in user
        const initialUserQuota: Quota = {
            used: 0,
            limit: INITIAL_FREE_GENERATIONS,
            isSubscribed: false,
        };
        setQuota(initialUserQuota);
        localStorage.setItem(quotaKey, JSON.stringify(initialUserQuota));
      }
    } catch (error) {
      console.error("Failed to load quota from localStorage:", error);
      setQuota({
            used: 0,
            limit: INITIAL_FREE_GENERATIONS,
            isSubscribed: false,
        });
    }
    setIsLoadingQuota(false);
  }, [currentUser, isLoadingAuth, getQuotaKey]);

  const canGenerate = useCallback(() => {
    if (!currentUser) return false; // Cannot generate if not logged in
    return quota.used < quota.limit;
  }, [quota, currentUser]);

  const incrementUsage = useCallback(() => {
    if (!currentUser) return; // Should not happen if canGenerate is checked
    const quotaKey = getQuotaKey();
    if (!quotaKey) return;

    setQuota(prevQuota => {
      if (prevQuota.used < prevQuota.limit) {
        const newQuota = { ...prevQuota, used: prevQuota.used + 1 };
        try {
            localStorage.setItem(quotaKey, JSON.stringify(newQuota));
        } catch (error) {
            console.error("Failed to save quota to localStorage:", error);
        }
        return newQuota;
      }
      return prevQuota;
    });
  }, [currentUser, getQuotaKey]);

  const upgradeToPremium = useCallback(() => {
    if (!currentUser) return;
    const quotaKey = getQuotaKey();
    if (!quotaKey) return;

    const premiumQuota: Quota = {
      used: 0, // Reset usage on upgrade for the new "month"
      limit: PREMIUM_GENERATIONS_LIMIT,
      isSubscribed: true,
      subscriptionDate: Date.now(),
    };
    setQuota(premiumQuota);
    try {
      localStorage.setItem(quotaKey, JSON.stringify(premiumQuota));
    } catch (error) {
      console.error("Failed to save premium quota to localStorage:", error);
    }
  }, [currentUser, getQuotaKey]);

  return (
    <QuotaContext.Provider value={{ quota, canGenerate, incrementUsage, isLoadingQuota, upgradeToPremium }}>
      {children}
    </QuotaContext.Provider>
  );
};

export const useQuota = (): QuotaContextType => {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    throw new Error('useQuota must be used within a QuotaProvider');
  }
  return context;
};
