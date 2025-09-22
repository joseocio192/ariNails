import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Hook para registro
export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('token');
      // Limpiar toda la caché
      queryClient.clear();
    },
  });
};

// Hook para obtener perfil
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: authService.isAuthenticated(), // Solo ejecutar si hay token
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para verificar si está autenticado
export const useAuth = () => {
  const { data: profile, isLoading, error } = useProfile();
  
  return {
    user: profile?.data,
    isAuthenticated: !!profile?.data && !error,
    isLoading,
  };
};
