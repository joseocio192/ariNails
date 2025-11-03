'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useUserRole } from '../../hooks/useUserRole';

/**
 * Componente de ejemplo que renderiza contenido diferente según el rol del usuario
 * 
 * Uso:
 * ```tsx
 * <RoleBasedContent 
 *   adminContent={<AdminDashboard />}
 *   employeeContent={<EmployeeDashboard />}
 *   clientContent={<ClientDashboard />}
 * />
 * ```
 */

interface RoleBasedContentProps {
  adminContent?: React.ReactNode;
  employeeContent?: React.ReactNode;
  clientContent?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  adminContent,
  employeeContent,
  clientContent,
  fallback = <Typography>Contenido no disponible</Typography>
}) => {
  const { isAdmin, isEmployee, isClient, isLoading, isAuthenticated } = useUserRole();

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  if (!isAuthenticated) {
    return (
      <Alert severity="warning">
        Debes iniciar sesión para ver este contenido
      </Alert>
    );
  }

  if (isAdmin && adminContent) {
    return <>{adminContent}</>;
  }

  if (isEmployee && employeeContent) {
    return <>{employeeContent}</>;
  }

  if (isClient && clientContent) {
    return <>{clientContent}</>;
  }

  return <>{fallback}</>;
};

/**
 * HOC (Higher Order Component) para proteger rutas según el rol
 * 
 * Uso:
 * ```tsx
 * const AdminOnlyPage = withRoleProtection(AdminDashboard, ['admin']);
 * const StaffPage = withRoleProtection(StaffDashboard, ['admin', 'empleado']);
 * ```
 */
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  allowedRoles: Array<'admin' | 'empleado' | 'cliente'>
) => {
  return (props: any) => {
    const { isAdmin, isEmployee, isClient, isLoading, isAuthenticated } = useUserRole();

    if (isLoading) {
      return <Typography>Cargando...</Typography>;
    }

    if (!isAuthenticated) {
      return (
        <Alert severity="error">
          Debes iniciar sesión para acceder a esta página
        </Alert>
      );
    }

    const hasPermission = 
      (allowedRoles.includes('admin') && isAdmin) ||
      (allowedRoles.includes('empleado') && isEmployee) ||
      (allowedRoles.includes('cliente') && isClient);

    if (!hasPermission) {
      return (
        <Box sx={{ p: 4 }}>
          <Alert severity="error">
            No tienes permisos para acceder a esta página
          </Alert>
        </Box>
      );
    }

    return <Component {...props} />;
  };
};

/**
 * Componente para mostrar información solo a administradores
 */
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useUserRole();
  return isAdmin ? <>{children}</> : null;
};

/**
 * Componente para mostrar información solo a empleados
 */
export const EmployeeOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isEmployee } = useUserRole();
  return isEmployee ? <>{children}</> : null;
};

/**
 * Componente para mostrar información solo a clientes
 */
export const RoleClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isClient } = useUserRole();
  return isClient ? <>{children}</> : null;
};

/**
 * Componente para mostrar información a staff (admin + empleados)
 */
export const StaffOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isEmployee } = useUserRole();
  return (isAdmin || isEmployee) ? <>{children}</> : null;
};
