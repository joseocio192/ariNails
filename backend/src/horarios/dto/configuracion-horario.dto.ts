import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, Min, Max } from 'class-validator';

export class ConfiguracionHorarioDto {
  @ApiProperty({ description: 'ID del empleado', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  empleadoId: number;

  @ApiProperty({ 
    description: 'Día de la semana (0=domingo, 1=lunes, ..., 6=sábado)', 
    example: 1,
    minimum: 0,
    maximum: 6
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @ApiProperty({ description: 'Hora de inicio en formato HH:mm', example: '09:00' })
  @IsString()
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin en formato HH:mm', example: '18:00' })
  @IsString()
  horaFin: string;
}