/**
 * Tipos para gestión de horarios laborales
 */

export interface ConfiguracionHorario {
  empleadoId: number;
  diaSemana: number; // 0=domingo, 1=lunes, ..., 6=sábado
  horaInicio: string; // formato HH:mm
  horaFin: string; // formato HH:mm
}

export interface HorarioEmpleado {
  id: number;
  empleadoId: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearHorarioDto {
  empleadoId: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
}

export interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  empleadoId?: number;
}

export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', abrev: 'Dom' },
  { id: 1, nombre: 'Lunes', abrev: 'Lun' },
  { id: 2, nombre: 'Martes', abrev: 'Mar' },
  { id: 3, nombre: 'Miércoles', abrev: 'Mié' },
  { id: 4, nombre: 'Jueves', abrev: 'Jue' },
  { id: 5, nombre: 'Viernes', abrev: 'Vie' },
  { id: 6, nombre: 'Sábado', abrev: 'Sáb' },
];

export const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];
