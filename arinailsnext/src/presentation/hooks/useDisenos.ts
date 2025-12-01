import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';
import type { IHttpClient } from '@/core/infrastructure/http/AxiosHttpClient';
import type {
  DisenoUna,
  CreateDisenoData,
  UpdateDisenoData,
  GetDisenosQuery,
  DisenosResponse,
} from '@/core/domain/types/disenos';
import type { ApiResponse } from '@/core/domain/types/empleados';

const diContainer = DIContainer.getInstance();
const httpClient = diContainer.get<IHttpClient>('IHttpClient');

/**
 * Hook para obtener lista paginada de diseños (admin/empleados)
 */
export const useGetDisenos = (query: GetDisenosQuery) => {
  const queryParams = new URLSearchParams();
  
  if (query.page) queryParams.append('page', query.page.toString());
  if (query.limit) queryParams.append('limit', query.limit.toString());
  if (query.search) queryParams.append('search', query.search);
  if (query.sortBy) queryParams.append('sortBy', query.sortBy);
  if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder);

  return useQuery<DisenosResponse>({
    queryKey: ['disenos', query],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<DisenosResponse>>(
        `/disenos?${queryParams.toString()}`
      );
      return response.data;
    },
    staleTime: 30000,
  });
};

/**
 * Hook para obtener todos los diseños activos (clientes)
 */
export const useGetDisenosActivos = () => {
  return useQuery<DisenoUna[]>({
    queryKey: ['disenos', 'active'],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<DisenoUna[]>>(
        '/disenos/active'
      );
      return response.data;
    },
    staleTime: 60000, // Cache por 1 minuto
  });
};

/**
 * Hook para obtener un diseño por ID
 */
export const useGetDiseno = (id: number) => {
  return useQuery<DisenoUna>({
    queryKey: ['diseno', id],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<DisenoUna>>(
        `/disenos/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook para crear un nuevo diseño
 */
export const useCreateDiseno = () => {
  const queryClient = useQueryClient();

  return useMutation<DisenoUna, Error, CreateDisenoData>({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      if (data.descripcion) {
        formData.append('descripcion', data.descripcion);
      }
      formData.append('imagen', data.imagen);

      const response = await httpClient.post<ApiResponse<DisenoUna>>(
        '/disenos',
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disenos'] });
    },
  });
};

/**
 * Hook para actualizar un diseño
 */
export const useUpdateDiseno = () => {
  const queryClient = useQueryClient();

  return useMutation<DisenoUna, Error, { id: number; data: UpdateDisenoData }>({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      if (data.titulo) {
        formData.append('titulo', data.titulo);
      }
      if (data.descripcion !== undefined) {
        formData.append('descripcion', data.descripcion);
      }
      if (data.imagen) {
        formData.append('imagen', data.imagen);
      }

      const response = await httpClient.patch<ApiResponse<DisenoUna>>(
        `/disenos/${id}`,
        formData
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disenos'] });
      queryClient.invalidateQueries({ queryKey: ['diseno', variables.id] });
    },
  });
};

/**
 * Hook para eliminar un diseño
 */
export const useDeleteDiseno = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await httpClient.delete<ApiResponse<null>>(`/disenos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disenos'] });
    },
  });
};
