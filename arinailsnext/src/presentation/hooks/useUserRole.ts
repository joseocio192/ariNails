'use client';

import { useMemo } from 'react';
import { useAuth } from './useSimpleAuth';
import { UserEntity } from '@/core/domain/entities/User';

/**
 * Hook personalizado para acceder a la información del rol del usuario
 * @returns Información del usuario y funciones de utilidad basadas en roles
 */
export const useUserRole = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const userEntity = useMemo(() => {
    return user ? new UserEntity(user) : null;
  }, [user]);

  return {
    user,
    userEntity,
    isAuthenticated,
    isLoading,
    
    // Funciones de verificación de rol
    isAdmin: userEntity?.isAdmin ?? false,
    isEmployee: userEntity?.isEmployee ?? false,
    isClient: userEntity?.isClient ?? false,
    
    // Información del rol
    roleName: userEntity?.roleName ?? '',
    roleDescription: userEntity?.roleDescription ?? '',
    fullName: userEntity?.fullName ?? '',
    
    // IDs específicos
    clienteId: user?.clienteId,
    empleadoId: user?.empleadoId,
    userId: user?.id,
  };
};
