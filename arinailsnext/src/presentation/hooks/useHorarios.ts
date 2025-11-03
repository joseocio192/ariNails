import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';
import type { ConfiguracionHorario } from '@/core/infrastructure/repositories/HorariosRepository';

// Get the horarios repository from DI container
const diContainer = DIContainer.getInstance();
const horariosRepository = diContainer.getHorariosRepository();

/**
 * Hook para obtener horarios disponibles por fecha
 */
export const useGetHorariosDisponibles = (fecha: string) => {
  return useQuery({
    queryKey: ['horarios', 'disponibles', fecha],
    queryFn: () => horariosRepository.obtenerHorariosDisponibles(fecha),
    enabled: !!fecha,
  });
};

/**
 * Hook para obtener configuración de horarios de un empleado
 */
export const useGetConfiguracionHorarios = (empleadoId: number) => {
  return useQuery({
    queryKey: ['horarios', 'configuracion', empleadoId],
    queryFn: () => horariosRepository.obtenerConfiguracionHorarios(empleadoId),
    enabled: !!empleadoId,
  });
};

/**
 * Hook para crear configuración de horario
 */
export const useCrearHorario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      empleadoId: number;
      fecha: string;
      horaInicio: string;
      horaFin: string;
    }) => horariosRepository.crearConfiguracionHorario(data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['horarios', 'configuracion', variables.empleadoId] });
    },
  });
};

/**
 * Hook para actualizar configuración de horario
 */
export const useActualizarHorario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ConfiguracionHorario> }) =>
      horariosRepository.actualizarConfiguracionHorario(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['horarios', 'configuracion', variables.data.empleadoId] });
    },
  });
};

/**
 * Hook para eliminar configuración de horario
 */
export const useEliminarHorario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, empleadoId }: { id: number; empleadoId: number }) =>
      horariosRepository.eliminarConfiguracionHorario(id, empleadoId),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['horarios', 'configuracion', variables.empleadoId] });
    },
  });
};
