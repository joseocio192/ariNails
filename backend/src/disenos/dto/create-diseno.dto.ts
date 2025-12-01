import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDisenoDto {
  @ApiProperty({
    description: 'Título del diseño de uñas',
    example: 'Diseño Floral Primavera',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción del diseño',
    example: 'Diseño con flores rosas y verdes sobre base blanca',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
