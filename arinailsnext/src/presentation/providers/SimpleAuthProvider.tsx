'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/core/domain/entities/User';
import { DIContainer } from '@/core/di/DIContainer';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initAuth = async () => {
      try {
        // Get auth use cases from DI container
        const diContainer = DIContainer.getInstance();
        const authUseCases = diContainer.getAuthUseCases();
        
        // Check if user is authenticated and get current user
        if (authUseCases.isAuthenticated()) {
          const currentUser = await authUseCases.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isClient]);

  const isAuthenticated = !!user && isClient;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading: isLoading || !isClient, 
        setUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};