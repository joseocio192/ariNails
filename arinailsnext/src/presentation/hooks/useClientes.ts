'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';
import type { IHttpClient } from '@/core/infrastructure/http/AxiosHttpClient';
import type {
  ApiResponse,
  ClienteListResponse,
  GetClientesQuery,
  UpdateClienteData,
  ClienteListItem,
} from '@/core/domain/types/clientes';

/**
 * Hook para obtener lista de clientes con paginación y búsqueda
 */
export const useGetClientes = (query: GetClientesQuery) => {
  const diContainer = DIContainer.getInstance();
  const httpClient = diContainer.get<IHttpClient>('IHttpClient');

  return useQuery<ClienteListResponse>({
    queryKey: ['clientes', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortOrder) params.append('sortOrder', query.sortOrder);
      if (query.estaActivo !== undefined)
        params.append('estaActivo', query.estaActivo.toString());

      const response = await httpClient.get<ApiResponse<ClienteListResponse>>(
        `/clientes?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
};

/**
 * Hook para obtener un cliente por ID
 */
export const useGetCliente = (id: number) => {
  const diContainer = DIContainer.getInstance();
  const httpClient = diContainer.get<IHttpClient>('IHttpClient');

  return useQuery<ClienteListItem>({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<ClienteListItem>>(`/clientes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook para actualizar datos del cliente
 */
export const useUpdateCliente = () => {
  const diContainer = DIContainer.getInstance();
  const httpClient = diContainer.get<IHttpClient>('IHttpClient');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateClienteData;
    }) => {
      const response = await httpClient.put<ApiResponse<ClienteListItem>>(
        `/clientes/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida todas las queries de clientes para refrescar
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente'] });
    },
  });
};

/**
 * Hook para habilitar/deshabilitar cuenta del cliente
 */
export const useToggleClienteStatus = () => {
  const diContainer = DIContainer.getInstance();
  const httpClient = diContainer.get<IHttpClient>('IHttpClient');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      estaActivo,
    }: {
      id: number;
      estaActivo: boolean;
    }) => {
      const response = await httpClient.patch<ApiResponse<ClienteListItem>>(
        `/clientes/${id}/status`,
        { estaActivo },
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida todas las queries de clientes para refrescar
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente'] });
    },
  });
};
