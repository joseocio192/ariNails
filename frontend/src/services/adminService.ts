import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Services Management
export const servicesApi = {
  getAll: () => axios.get(`${API_URL}/servicios`),
  getById: (id: number) => axios.get(`${API_URL}/servicios/${id}`, { headers: getAuthHeaders() }),
  create: (data: any) => axios.post(`${API_URL}/servicios`, data, { headers: getAuthHeaders() }),
  update: (id: number, data: any) => axios.put(`${API_URL}/servicios/${id}`, data, { headers: getAuthHeaders() }),
  delete: (id: number) => axios.delete(`${API_URL}/servicios/${id}`, { headers: getAuthHeaders() })
};

// Appointments Management
export const appointmentsApi = {
  getAll: (fecha?: string) => {
    const url = fecha ? `${API_URL}/citas/admin/todas?fecha=${fecha}` : `${API_URL}/citas/admin/todas`;
    return axios.get(url, { headers: getAuthHeaders() });
  },
  getStatistics: () => axios.get(`${API_URL}/citas/admin/estadisticas`, { headers: getAuthHeaders() }),
  updateStatus: (id: number, status: 'completada' | 'cancelada', motivo?: string) => 
    axios.put(`${API_URL}/citas/admin/${id}/estado`, { estado: status, motivo }, { headers: getAuthHeaders() })
};

// Calendar Management
export const calendarApi = {
  getScheduleStatus: (fechaInicio: string, fechaFin: string) => 
    axios.get(`${API_URL}/horarios/admin/calendario`, { 
      params: { fechaInicio, fechaFin },
      headers: getAuthHeaders() 
    }),
  blockSchedule: (horarioId: number) => 
    axios.post(`${API_URL}/horarios/admin/bloquear/${horarioId}`, {}, { headers: getAuthHeaders() }),
  enableSchedule: (horarioId: number) => 
    axios.post(`${API_URL}/horarios/admin/habilitar/${horarioId}`, {}, { headers: getAuthHeaders() }),
  blockDay: (fecha: string, empleadoId?: number) => 
    axios.post(`${API_URL}/horarios/admin/bloquear-dia`, { fecha, empleadoId }, { headers: getAuthHeaders() }),
  enableDay: (fecha: string, empleadoId?: number) => 
    axios.post(`${API_URL}/horarios/admin/habilitar-dia`, { fecha, empleadoId }, { headers: getAuthHeaders() })
};

export const adminService = {
  services: servicesApi,
  appointments: appointmentsApi,
  calendar: calendarApi
};