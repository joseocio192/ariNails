import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
        <Box className="text-center">
          <Box className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Typography variant="h4" className="text-white font-bold">
              AN
            </Typography>
          </Box>
          <CircularProgress size={40} sx={{ color: '#ec4899' }} />
          <Typography variant="h6" className="mt-4 text-gray-600">
            Verificando autenticación...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
