import { ApiProperty } from '@nestjs/swagger';

export class ClienteInfoDto {
  @ApiProperty({ description: 'ID único del cliente', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombres del cliente', example: 'Ana' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos del cliente', example: 'Martínez López' })
  apellidos: string;

  @ApiProperty({ description: 'Teléfono del cliente', example: '+52 555-1234567' })
  telefono: string;
}

export class EmpleadoInfoDto {
  @ApiProperty({ description: 'ID único del empleado', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombres del empleado', example: 'María' })
  nombres: string;

  @ApiProperty({ description: 'Apellidos del empleado', example: 'García López' })
  apellidos: string;
}

export class CitaEmpleadoVistaDto {
  @ApiProperty({ description: 'ID único de la cita', example: 123 })
  id: number;

  @ApiProperty({ description: 'Fecha de la cita', example: '2024-12-20T00:00:00.000Z' })
  fecha: Date;

  @ApiProperty({ description: 'Hora de la cita en formato HH:mm', example: '09:00' })
  hora: string;

  @ApiProperty({ description: 'Información del cliente', type: ClienteInfoDto })
  cliente: ClienteInfoDto;

  @ApiProperty({ 
    description: 'Lista de servicios a realizar', 
    example: ['Manicure Clásica', 'Pedicure Spa'],
    type: [String]
  })
  servicios: string[];

  @ApiProperty({ description: 'Precio total de la cita', example: 350.00 })
  precio: number;

  @ApiProperty({ description: 'Indica si la cita está cancelada', example: false })
  cancelada: boolean;
}

export class CitaClienteVistaDto {
  @ApiProperty({ description: 'ID único de la cita', example: 123 })
  id: number;

  @ApiProperty({ description: 'Fecha de la cita', example: '2024-12-20T00:00:00.000Z' })
  fecha: Date;

  @ApiProperty({ description: 'Hora de la cita en formato HH:mm', example: '09:00' })
  hora: string;

  @ApiProperty({ description: 'Información del empleado', type: EmpleadoInfoDto })
  empleado: EmpleadoInfoDto;

  @ApiProperty({ 
    description: 'Lista de servicios a realizar', 
    example: ['Manicure Clásica', 'Pedicure Spa'],
    type: [String]
  })
  servicios: string[];

  @ApiProperty({ description: 'Precio total de la cita', example: 350.00 })
  precio: number;

  @ApiProperty({ description: 'Indica si la cita está cancelada', example: false })
  cancelada: boolean;
}