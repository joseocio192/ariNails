import { IHttpClient } from '../http/AxiosHttpClient';

/**
 * Horario disponible interface
 */
export interface HorarioDisponible {
  horarioId: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

/**
 * Configuración de horario (tal como viene del backend)
 */
export interface ConfiguracionHorario {
  id: number;
  desde: Date | string;
  hasta: Date | string;
  estaActivo: boolean;
  empleado?: {
    id: number;
  };
  empleadoId?: number;
  diaSemana?: number; // Para enviar al backend
  horaInicio?: string; // Para enviar al backend
  horaFin?: string; // Para enviar al backend
  activo?: boolean; // Para enviar al backend
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response interface para horarios disponibles
 */
export interface HorariosDisponiblesResponse {
  data: HorarioDisponible[];
  message: string;
  isValid: boolean;
}

/**
 * Response interface para configuración de horarios
 */
export interface ConfiguracionHorariosResponse {
  data: ConfiguracionHorario[];
  message: string;
  isValid: boolean;
}

/**
 * Repository para gestionar horarios
 */
export class HorariosRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  /**
   * Obtener horarios disponibles para una fecha específica
   */
  async obtenerHorariosDisponibles(fecha: string): Promise<HorarioDisponible[]> {
    try {
      const response = await this.httpClient.get<HorariosDisponiblesResponse>(
        `/horarios/disponibles?fecha=${fecha}`
      );
      // Extraer el array de data del IResponse wrapper
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting available horarios:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración de horarios de un empleado
   */
  async obtenerConfiguracionHorarios(empleadoId: number): Promise<ConfiguracionHorario[]> {
    try {
      const response = await this.httpClient.get<ConfiguracionHorariosResponse>(
        `/horarios/empleado/${empleadoId}`
      );
      return response.data || [];
    } catch (error: any) {
      console.error('Error getting horarios configuration:', error);
      throw error;
    }
  }

  /**
   * Crear configuración de horario (usa el endpoint /horarios/empleado/crear)
   */
  async crearConfiguracionHorario(data: {
    empleadoId: number;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }): Promise<ConfiguracionHorario> {
    try {
      const response = await this.httpClient.post<{ data: ConfiguracionHorario }>(
        '/horarios/empleado/crear',
        data
      );
      return response.data || data as any;
    } catch (error: any) {
      console.error('Error creating horario configuration:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de horario
   */
  async actualizarConfiguracionHorario(
    id: number,
    data: Partial<ConfiguracionHorario>
  ): Promise<ConfiguracionHorario> {
    try {
      const response = await this.httpClient.put<ConfiguracionHorario>(
        `/horarios/${id}`,
        data
      );
      return response;
    } catch (error: any) {
      console.error('Error updating horario configuration:', error);
      throw error;
    }
  }

  /**
   * Eliminar configuración de horario
   */
  async eliminarConfiguracionHorario(id: number, empleadoId?: number): Promise<void> {
    try {
      if (empleadoId) {
        // Si tenemos empleadoId, usar la ruta específica del backend
        await this.httpClient.delete(`/horarios/empleado/${empleadoId}/horario/${id}`);
      } else {
        await this.httpClient.delete(`/horarios/${id}`);
      }
    } catch (error: any) {
      console.error('Error deleting horario configuration:', error);
      throw error;
    }
  }
}
