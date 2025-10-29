'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../providers/SimpleAuthProvider';
import { DIContainer } from '@/core/di/DIContainer';
import { LoginCredentials, RegisterData, User } from '@/core/domain/entities/User';

// Get the auth use cases from DI container
const diContainer = DIContainer.getInstance();
const authUseCases = diContainer.getAuthUseCases();

/**
 * Authentication Hooks following Clean Architecture
 */

// Hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthContext();

  return useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return await authUseCases.login(credentials);
    },
    onSuccess: (user: User) => {
      setUser(user);
      queryClient.setQueryData(['user'], user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
    },
  });
};

// Hook for registration
export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthContext();

  return useMutation<User, Error, RegisterData>({
    mutationFn: async (userData: RegisterData) => {
      return await authUseCases.register(userData);
    },
    onSuccess: (user: User) => {
      setUser(user);
      queryClient.setQueryData(['user'], user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      console.error('Registration error:', error);
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthContext();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await authUseCases.logout();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      setUser(null);
      queryClient.clear();
    },
  });
};

// Hook for checking authentication status
export const useAuth = () => {
  const authContext = useAuthContext();
  
  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: null,
  };
};

// Hook for getting current user
export const useCurrentUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User | null, Error, void>({
    mutationFn: async () => {
      return await authUseCases.getCurrentUser();
    },
    onSuccess: (user) => {
      if (user) {
        queryClient.setQueryData(['user'], user);
      }
    },
  });
};