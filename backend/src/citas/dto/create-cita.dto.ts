import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, IsDateString, Min } from 'class-validator';

export class CreateCitaDto {
  @ApiProperty({ description: 'ID del cliente', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  clienteId: number;

  @ApiProperty({ description: 'ID del empleado', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  empleadoId: number;

  @ApiProperty({ description: 'Fecha de la cita en formato YYYY-MM-DD', example: '2024-12-20' })
  @IsDateString()
  fecha: string;

  @ApiProperty({ description: 'Hora de la cita en formato HH:mm', example: '09:00' })
  @IsString()
  hora: string;

  @ApiProperty({ 
    description: 'IDs de los servicios a realizar', 
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  serviciosIds: number[];
}
