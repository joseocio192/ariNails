// Types para el módulo de empleados
export interface ApiResponse<T> {
  data: T;
  message: string;
  isValid: boolean;
}

export interface EmpleadoListItem {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  direccion: string;
  ultimaSesion: Date | null;
  citasCompletadas: number;
  citasCanceladas: number;
  totalCitas: number;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export interface EmpleadoListResponse {
  data: EmpleadoListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetEmpleadosQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'nombreCompleto' | 'email' | 'telefono' | 'ultimaSesion' | 'totalCitas' | 'fechaCreacion';
  sortOrder?: 'ASC' | 'DESC';
  estaActivo?: boolean;
}

export interface UpdateEmpleadoData {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ToggleEmpleadoStatus {
  estaActivo: boolean;
}

export interface AvailableUser {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  nombreCompleto: string;
}

export interface AvailableUsersResponse {
  data: AvailableUser[];
  total: number;
}

export interface GetAvailableUsersQuery {
  search?: string;
}

export interface PromoteUserData {
  // Sin campos requeridos - solo se actualiza el rol
}
