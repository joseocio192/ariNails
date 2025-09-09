import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, Min } from 'class-validator';

export class CrearHorarioDto {
  @ApiProperty({ description: 'ID del empleado', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  empleadoId: number;

  @ApiProperty({ description: 'Fecha del horario en formato YYYY-MM-DD', example: '2024-12-20' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ description: 'Hora de inicio en formato HH:mm', example: '09:00' })
  @IsString()
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin en formato HH:mm', example: '10:00' })
  @IsString()
  horaFin: string;
}