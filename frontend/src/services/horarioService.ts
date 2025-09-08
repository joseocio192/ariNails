import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface HorarioDisponible {
  hora: string;
  empleado: {
    id: number;
    nombre: string;
    apellidos: string;
  };
}

export interface ConfiguracionHorario {
  empleadoId: number;
  diaSemana: number; // 0=domingo, 1=lunes, ..., 6=sábado
  horaInicio: string; // formato HH:mm
  horaFin: string;
}

// Configurar axios para incluir el token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const horarioService = {
  // Obtener horarios disponibles para una fecha específica con información del empleado
  async obtenerHorariosDisponibles(fecha: string): Promise<HorarioDisponible[]> {
    try {
      const response = await axios.get(`${API_URL}/horarios/disponibles/${fecha}`, getAuthHeaders());
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener horarios disponibles:', error);
      throw error;
    }
  },

  // Verificar si un día está activo
  async verificarDiaActivo(fecha: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/horarios/activo/${fecha}`, getAuthHeaders());
      return response.data.data || false;
    } catch (error) {
      console.error('Error al verificar día activo:', error);
      throw error;
    }
  },

  // Configurar horarios para empleados (solo admin/empleados)
  async configurarHorarios(configuraciones: ConfiguracionHorario[]): Promise<void> {
    try {
      await axios.post(`${API_URL}/horarios/configurar`, configuraciones, getAuthHeaders());
    } catch (error) {
      console.error('Error al configurar horarios:', error);
      throw error;
    }
  },

  // Obtener horarios de un empleado específico
  async obtenerHorariosEmpleado(empleadoId: number): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/horarios/empleado/${empleadoId}`, getAuthHeaders());
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener horarios del empleado:', error);
      throw error;
    }
  },

  // Inicializar horarios de prueba
  async inicializarHorarios(): Promise<void> {
    try {
      await axios.post(`${API_URL}/horarios/inicializar`, {}, getAuthHeaders());
    } catch (error) {
      console.error('Error al inicializar horarios:', error);
      throw error;
    }
  }
};
