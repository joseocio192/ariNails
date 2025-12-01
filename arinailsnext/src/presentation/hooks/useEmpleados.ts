"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';
import type { IHttpClient } from '@/core/infrastructure/http/AxiosHttpClient';
import {
  EmpleadoListResponse,
  GetEmpleadosQuery,
  UpdateEmpleadoData,
  ToggleEmpleadoStatus,
  EmpleadoListItem,
  ApiResponse,
  AvailableUsersResponse,
  GetAvailableUsersQuery,
  PromoteUserData,
} from '@/core/domain/types/empleados';
import { useEffect, useState } from 'react';

const diContainer = DIContainer.getInstance();
const httpClient = diContainer.get<IHttpClient>('IHttpClient');

/**
 * Hook para obtener lista paginada de empleados
 */
export const useGetEmpleados = (query: GetEmpleadosQuery) => {
  const [debouncedSearch, setDebouncedSearch] = useState(query.search || '');

  // Debounce para el search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(query.search || '');
    }, 500);

    return () => clearTimeout(handler);
  }, [query.search]);

  const queryParams = new URLSearchParams();
  if (query.page) queryParams.append('page', query.page.toString());
  if (query.limit) queryParams.append('limit', query.limit.toString());
  if (debouncedSearch) queryParams.append('search', debouncedSearch);
  if (query.sortBy) queryParams.append('sortBy', query.sortBy);
  if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder);
  if (query.estaActivo !== undefined)
    queryParams.append('estaActivo', query.estaActivo.toString());

  return useQuery<EmpleadoListResponse>({
    queryKey: ['empleados', query.page, query.limit, debouncedSearch, query.sortBy, query.sortOrder, query.estaActivo],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<EmpleadoListResponse>>(
        `/empleados/list?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

/**
 * Hook para obtener un empleado por ID
 */
export const useGetEmpleado = (id: number) => {
  return useQuery<EmpleadoListItem>({
    queryKey: ['empleado', id],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<EmpleadoListItem>>(`/empleados/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook para actualizar un empleado
 */
export const useUpdateEmpleado = () => {
  const queryClient = useQueryClient();

  return useMutation<EmpleadoListItem, Error, { id: number; data: UpdateEmpleadoData }>({
    mutationFn: async ({ id, data }) => {
      const response = await httpClient.put<ApiResponse<EmpleadoListItem>>(`/empleados/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado'] });
    },
  });
};

/**
 * Hook para habilitar/deshabilitar empleado
 */
export const useToggleEmpleadoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<EmpleadoListItem, Error, { id: number; data: ToggleEmpleadoStatus }>({
    mutationFn: async ({ id, data }) => {
      const response = await httpClient.patch<ApiResponse<EmpleadoListItem>>(`/empleados/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado'] });
    },
  });
};

/**
 * Hook para obtener usuarios disponibles para convertir en empleados
 */
export const useGetAvailableUsers = (query: GetAvailableUsersQuery) => {
  const [debouncedSearch, setDebouncedSearch] = useState(query.search || '');

  // Debounce para el search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(query.search || '');
    }, 500);

    return () => clearTimeout(handler);
  }, [query.search]);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.append('search', debouncedSearch);

  return useQuery<AvailableUsersResponse>({
    queryKey: ['available-users', debouncedSearch],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<AvailableUsersResponse>>(
        `/empleados/available-users?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

/**
 * Hook para promover un usuario a empleado
 */
export const usePromoteToEmpleado = () => {
  const queryClient = useQueryClient();

  return useMutation<EmpleadoListItem, Error, { usuarioId: number; data: PromoteUserData }>({
    mutationFn: async ({ usuarioId, data }) => {
      const response = await httpClient.post<ApiResponse<EmpleadoListItem>>(
        `/empleados/${usuarioId}/promote`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
    },
  });
};

/**
 * Hook para degradar un empleado a cliente
 */
export const useDemoteToCliente = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (empleadoId) => {
      await httpClient.delete<ApiResponse<null>>(`/empleados/${empleadoId}/demote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['available-users'] });
    },
  });
};
