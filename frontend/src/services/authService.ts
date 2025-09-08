import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Configurar axios con interceptores
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  email: string;
  password: string;
}

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

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    
    
    // Guardar el token en localStorage
    if (response.data?.isValid && response.data?.data) {
      localStorage.setItem('token', response.data.data);
    } else {
      console.error('❌ No token received or invalid response:', response.data);
    }
    
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post('/usuario/cliente', userData);
    return response.data;
  },

  // Función para verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
};

export default api;
