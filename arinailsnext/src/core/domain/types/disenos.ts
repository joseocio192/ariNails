// Tipos para Diseños de Uñas

export interface DisenoUna {
  id: number;
  titulo: string;
  imagenUrl: string;
  descripcion?: string;
  empleadoIdCreador: number;
  nombreEmpleado: string;
  fechaCreacion: Date;
  estaActivo: boolean;
}

export interface CreateDisenoData {
  titulo: string;
  descripcion?: string;
  imagen: File;
}

export interface UpdateDisenoData {
  titulo?: string;
  descripcion?: string;
  imagen?: File;
}

export interface GetDisenosQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'titulo' | 'fechaCreacion';
  sortOrder?: 'ASC' | 'DESC';
}

export interface DisenosResponse {
  data: DisenoUna[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
