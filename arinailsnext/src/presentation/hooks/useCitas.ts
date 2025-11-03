'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';

// Get the citas repository from DI container
const diContainer = DIContainer.getInstance();
const citasRepository = diContainer.getCitasRepository();

/**
 * Hook para obtener todas las citas (Admin)
 * REQUIERE filtros de fecha para optimizar rendimiento
 */
export const useGetTodasLasCitas = (fecha?: string, fechaInicio?: string, fechaFin?: string) => {
  return useQuery({
    queryKey: ['citas', 'todas', fecha, fechaInicio, fechaFin],
    queryFn: async () => {
      const response = await citasRepository.obtenerTodasLasCitas(fecha, fechaInicio, fechaFin);
      return response.data;
    },
    // Solo ejecutar si hay fecha específica O rango de fechas
    enabled: !!fecha || (!!fechaInicio && !!fechaFin),
  });
};

/**
 * Hook para obtener citas de un empleado
 * REQUIERE filtros de fecha para optimizar rendimiento
 */
export const useGetCitasEmpleado = (
  empleadoId?: number, 
  fecha?: string,
  fechaInicio?: string,
  fechaFin?: string
) => {
  return useQuery({
    queryKey: ['citas', 'empleado', empleadoId, fecha, fechaInicio, fechaFin],
    queryFn: async () => {
      if (!empleadoId) throw new Error('empleadoId is required');
      const response = await citasRepository.obtenerCitasEmpleado(empleadoId, fecha, fechaInicio, fechaFin);
      return response.data;
    },
    // Solo ejecutar si hay empleadoId Y (fecha específica O rango de fechas)
    enabled: !!empleadoId && (!!fecha || (!!fechaInicio && !!fechaFin)),
  });
};

/**
 * Hook para obtener citas de un cliente
 */
export const useGetCitasCliente = (clienteId?: number) => {
  return useQuery({
    queryKey: ['citas', 'cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) throw new Error('clienteId is required');
      const response = await citasRepository.obtenerCitasCliente(clienteId);
      return response.data;
    },
    enabled: !!clienteId,
  });
};

/**
 * Hook para obtener las citas del cliente autenticado (alias de useGetCitasCliente)
 */
export const useGetMisCitas = useGetCitasCliente;

/**
 * Hook para obtener estadísticas de citas
 */
export const useGetEstadisticasCitas = () => {
  return useQuery({
    queryKey: ['citas', 'estadisticas'],
    queryFn: async () => {
      const response = await citasRepository.obtenerEstadisticas();
      return response.data;
    },
  });
};

/**
 * Hook para actualizar el estado de una cita
 */
export const useActualizarEstadoCita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      citaId, 
      estado, 
      motivo 
    }: { 
      citaId: number; 
      estado: 'completada' | 'cancelada'; 
      motivo?: string;
    }) => {
      return await citasRepository.actualizarEstadoCita(citaId, estado, motivo);
    },
    onSuccess: () => {
      // Invalidar todas las queries de citas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });
};

/**
 * Hook para cancelar una cita
 */
export const useCancelarCita = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      citaId, 
      motivo,
      realizarReembolso,
      nuevaFecha,
      nuevaHora
    }: { 
      citaId: number; 
      motivo: string;
      realizarReembolso?: boolean;
      nuevaFecha?: string;
      nuevaHora?: string;
    }) => {
      return await citasRepository.cancelarCita(citaId, motivo, realizarReembolso, nuevaFecha, nuevaHora);
    },
    onSuccess: () => {
      // Invalidar todas las queries de citas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['citas'] });
    },
  });
};
