export interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
}

export interface Empleado {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion?: number;
  precio?: number;
  categoria?: 'basico' | 'extra'; // Categoría del servicio
  cantidad?: number; // Cantidad disponible
  estaActivo?: boolean;
}

export interface Cita {
  id: number;
  fecha: Date;
  hora: string;
  duracion?: number;
  cancelada?: boolean;
  motivoCancelacion?: string;
  estado?: string;
  cliente: Cliente;
  empleado?: Empleado;
  servicios: Array<string | Servicio>;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Cita;
}