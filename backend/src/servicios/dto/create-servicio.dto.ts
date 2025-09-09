import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ 
    description: 'Nombre del servicio',
    example: 'Manicure Clásico'
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ 
    description: 'Descripción del servicio',
    example: 'Manicure tradicional con corte, limado y esmaltado'
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ 
    description: 'Precio del servicio',
    example: 25.99
  })
  @IsNumber()
  @IsPositive()
  precio: number;
}
