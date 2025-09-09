import { ApiProperty } from '@nestjs/swagger';

export class CitaInfoDto {
  @ApiProperty({ description: 'ID único de la cita', example: 123 })
  id: number;

  @ApiProperty({ description: 'Nombre del cliente', example: 'Ana Martínez' })
  cliente: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+52 555-1234567',
  })
  telefono: string;
}

export class HorarioEmpleadoVistaDto {
  @ApiProperty({ description: 'ID único del horario', example: 456 })
  id: number;

  @ApiProperty({
    description: 'Fecha del horario',
    example: '2024-12-20T00:00:00.000Z',
  })
  fecha: Date;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:mm',
    example: '09:00',
  })
  horaInicio: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:mm',
    example: '10:00',
  })
  horaFin: string;

  @ApiProperty({
    description: 'Indica si el horario está disponible (sin cita asignada)',
    example: true,
  })
  disponible: boolean;

  @ApiProperty({
    description: 'Información de la cita asignada (si existe)',
    type: CitaInfoDto,
    required: false,
  })
  cita?: CitaInfoDto;
}
