import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ITokenStorage } from '../../domain/repositories/IAuthRepository';

/**
 * HTTP Client Interface
 */
export interface IHttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

/**
 * Axios HTTP Client Implementation
 * Handles HTTP requests with automatic token injection and error handling
 */
export class AxiosHttpClient implements IHttpClient {
  private readonly client: AxiosInstance;

  constructor(
    private readonly tokenStorage: ITokenStorage,
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add token
    this.client.interceptors.request.use(
      (config: any) => {
        const token = this.tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.tokenStorage.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }

        // Handle other HTTP errors
        if (error.response) {
          // NestJS devuelve errores en varios formatos posibles
          const backendMessage = error.response.data?.message;
          const backendError = error.response.data?.error;
          
          // Si el mensaje es un array (validación de NestJS), tomar el primer mensaje
          const message = Array.isArray(backendMessage) 
            ? backendMessage[0] 
            : backendMessage || backendError || `Error ${error.response.status}: ${error.response.statusText}`;
          
          throw new Error(message);
        }

        // Network errors
        if (error.request) {
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        }

        // Other errors
        throw new Error(error.message || 'Error desconocido');
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}