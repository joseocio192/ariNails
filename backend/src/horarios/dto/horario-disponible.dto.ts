import { ApiProperty } from '@nestjs/swagger';

export class EmpleadoInfoDto {
  @ApiProperty({ description: 'ID único del empleado', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del empleado', example: 'María' })
  nombre: string;

  @ApiProperty({
    description: 'Apellidos del empleado',
    example: 'García López',
  })
  apellidos: string;
}

export class HorarioDisponibleDto {
  @ApiProperty({
    description: 'ID del horario (generado como empleadoId-hora)',
    example: '1-09:00',
  })
  horarioId: string;

  @ApiProperty({
    description: 'ID del empleado',
    example: 1,
  })
  empleadoId: number;

  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'María García López',
  })
  empleadoNombre: string;

  @ApiProperty({
    description: 'Fecha del horario en formato YYYY-MM-DD',
    example: '2024-12-20',
  })
  fecha: string;

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
    description: 'Indica si el horario está disponible',
    example: true,
  })
  disponible: boolean;

  @ApiProperty({
    description: 'Hora disponible en formato HH:mm (legacy)',
    example: '09:00',
  })
  hora?: string;

  @ApiProperty({
    description: 'Información del empleado disponible (legacy)',
    type: EmpleadoInfoDto,
  })
  empleado?: EmpleadoInfoDto;
}
