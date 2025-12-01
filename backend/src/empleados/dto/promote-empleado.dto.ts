import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PromoteToEmpleadoDto {
  @ApiPropertyOptional({ 
    description: 'Teléfono del empleado',
    example: '1234567890'
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ 
    description: 'Dirección del empleado',
    example: 'Calle Principal 123'
  })
  @IsOptional()
  @IsString()
  direccion?: string;
}
