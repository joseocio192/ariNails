/**
 * Tipos para gestión de clientes en el dashboard de administrador
 */

// Wrapper de respuesta del backend
export interface ApiResponse<T> {
  data: T;
  message: string;
  isValid: boolean;
}

export interface ClienteListItem {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  direccion?: string;
  ultimaSesion?: string;
  citasCompletadas: number;
  citasCanceladas: number;
  totalCitas: number;
  estaActivo: boolean;
  fechaCreacion: string;
}

export interface ClienteListResponse {
  data: ClienteListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetClientesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  estaActivo?: boolean;
}

export interface UpdateClienteData {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ToggleClienteStatus {
  estaActivo: boolean;
}
