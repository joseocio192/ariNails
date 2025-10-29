'use client';

import React from 'react';
import { useAuth } from '../../hooks/useSimpleAuth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Protected Route Component
 * Handles authentication-based route protection
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return fallback || (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(127, 161, 123, 0.3)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}>
          <img 
            src="/logo.png" 
            alt="Ari Nails Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
        <CircularProgress size={40} sx={{ color: '#7d9674' }} />
        <Typography variant="h6" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; 
  }

  return <>{children}</>;
};