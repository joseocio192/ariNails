import type { RegisterFormData } from './formTypes';

export interface LoginCredentials {
  username: string;
  password: string;
}

export type RegisterData = RegisterFormData;

export interface User {
  id: number;
  usuario: string;
  email: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rolId: number;
  rolNombre: string;
  rolDescripcion: string;
}
