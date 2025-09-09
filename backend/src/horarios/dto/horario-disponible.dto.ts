import { ApiProperty } from '@nestjs/swagger';

export class EmpleadoInfoDto {
  @ApiProperty({ description: 'ID único del empleado', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del empleado', example: 'María' })
  nombre: string;

  @ApiProperty({ description: 'Apellidos del empleado', example: 'García López' })
  apellidos: string;
}

export class HorarioDisponibleDto {
  @ApiProperty({ description: 'Hora disponible en formato HH:mm', example: '09:00' })
  hora: string;

  @ApiProperty({ description: 'Información del empleado disponible', type: EmpleadoInfoDto })
  empleado: EmpleadoInfoDto;
}