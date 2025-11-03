import { IHttpClient } from '../../infrastructure/http/AxiosHttpClient';

/**
 * Cita interface
 */
export interface Cita {
  id: number;
  fecha: Date;
  hora: string;
  duracion: number;
  estado?: string;
  cancelada?: boolean;
  motivoCancelacion?: string;
  precio?: number;
  anticipoPagado?: number;
  saldoPendiente?: number;
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    telefono: string;
  };
  empleado: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  servicios: Array<{
    id: number;
    nombre: string;
    duracion: number;
    precio: number;
  }>;
}

/**
 * Response interface para citas
 */
export interface CitasResponse {
  data: Cita[];
  message: string;
  isValid: boolean;
}

/**
 * Repository para gestionar citas
 */
export class CitasRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  /**
   * Obtener todas las citas (Admin)
   */
  async obtenerTodasLasCitas(fecha?: string, fechaInicio?: string, fechaFin?: string): Promise<CitasResponse> {
    try {
      let url = '/citas/admin/todas';
      const params = new URLSearchParams();
      
      if (fecha) {
        params.append('fecha', fecha);
      } else if (fechaInicio && fechaFin) {
        params.append('fechaInicio', fechaInicio);
        params.append('fechaFin', fechaFin);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.httpClient.get<CitasResponse>(url);
      return response;
    } catch (error: any) {
      console.error('Error getting all citas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas de un empleado específico
   */
  async obtenerCitasEmpleado(
    empleadoId: number, 
    fecha?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<CitasResponse> {
    try {
      let url = `/citas/empleado/${empleadoId}`;
      const params = new URLSearchParams();
      
      if (fecha) {
        params.append('fecha', fecha);
      } else if (fechaInicio && fechaFin) {
        params.append('fechaInicio', fechaInicio);
        params.append('fechaFin', fechaFin);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.httpClient.get<CitasResponse>(url);
      return response;
    } catch (error: any) {
      console.error('Error getting employee citas:', error);
      throw error;
    }
  }

  /**
   * Obtener citas de un cliente específico
   */
  async obtenerCitasCliente(clienteId: number): Promise<CitasResponse> {
    try {
      const response = await this.httpClient.get<CitasResponse>(`/citas/cliente/${clienteId}`);
      return response;
    } catch (error: any) {
      console.error('Error getting client citas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de citas (Admin)
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await this.httpClient.get('/citas/admin/estadisticas');
      return response;
    } catch (error: any) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una cita (Admin)
   */
  async actualizarEstadoCita(
    citaId: number, 
    estado: 'completada' | 'cancelada', 
    motivo?: string
  ): Promise<any> {
    try {
      const response = await this.httpClient.put(`/citas/admin/${citaId}/estado`, {
        estado,
        motivo
      });
      return response;
    } catch (error: any) {
      console.error('Error updating cita status:', error);
      throw error;
    }
  }

  /**
   * Cancelar una cita
   */
  async cancelarCita(
    citaId: number, 
    motivo: string,
    realizarReembolso?: boolean,
    nuevaFecha?: string,
    nuevaHora?: string
  ): Promise<any> {
    try {
      // Enviamos los datos en el body usando POST o PATCH
      const response = await this.httpClient.post(`/citas/${citaId}/cancelar`, {
        motivo,
        realizarReembolso,
        nuevaFecha,
        nuevaHora
      });
      return response;
    } catch (error: any) {
      console.error('Error canceling cita:', error);
      throw error;
    }
  }
}
