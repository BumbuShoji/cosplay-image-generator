
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';

const MOCK_GOOGLE_USER_KEY = 'cosplayAppMockUser';

interface AuthContextType {
  currentUser: User | null;
  isLoadingAuth: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Attempt to load mock user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem(MOCK_GOOGLE_USER_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load mock user from localStorage:", error);
    }
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback(() => {
    setIsLoadingAuth(true);
    // Simulate Google Sign-In
    setTimeout(() => {
      const mockUser: User = {
        id: `mock_google_user_${Date.now()}`, // Simple unique ID
        name: 'Magic User',
        email: 'magic.user@example.com',
        avatarUrl: `https://avatar.iran.liara.run/username?username=Magic+User`, // Placeholder avatar
        isLoggedIn: true,
      };
      setCurrentUser(mockUser);
      try {
        localStorage.setItem(MOCK_GOOGLE_USER_KEY, JSON.stringify(mockUser));
      } catch (error) {
        console.error("Failed to save mock user to localStorage:", error);
      }
      setIsLoadingAuth(false);
    }, 1000); // Simulate network delay
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(MOCK_GOOGLE_USER_KEY);
    } catch (error) {
      console.error("Failed to remove mock user from localStorage:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};