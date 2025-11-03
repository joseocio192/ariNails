import { useQuery } from '@tanstack/react-query';
import { DIContainer } from '@/core/di/DIContainer';
import { IHttpClient } from '@/core/infrastructure/http/AxiosHttpClient';

// Get the HTTP client from DI container
const diContainer = DIContainer.getInstance();
const httpClient = diContainer.get<IHttpClient>('IHttpClient');

/**
 * Servicio interface
 */
export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  estaActivo: boolean;
  categoria?: 'basico' | 'extra'; // Categoría del servicio
}

/**
 * Response interface del backend
 */
interface ServiciosResponse {
  data: Servicio[];
  message: string;
  isValid: boolean;
}

/**
 * Hook para obtener todos los servicios
 */
export const useGetServicios = () => {
  return useQuery({
    queryKey: ['servicios'],
    queryFn: async () => {
      const response = await httpClient.get<ServiciosResponse>('/servicios');
      // Extraer el array de servicios del objeto de respuesta
      return response.data;
    },
  });
};

/**
 * Response interface del backend para un servicio
 */
interface ServicioResponse {
  data: Servicio;
  message: string;
  isValid: boolean;
}

/**
 * Hook para obtener un servicio por ID
 */
export const useGetServicio = (id: number) => {
  return useQuery({
    queryKey: ['servicios', id],
    queryFn: async () => {
      const response = await httpClient.get<ServicioResponse>(`/servicios/${id}`);
      // Extraer el servicio del objeto de respuesta
      return response.data;
    },
    enabled: !!id,
  });
};
