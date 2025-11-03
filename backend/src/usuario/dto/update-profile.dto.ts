import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'nuevo@example.com', required: false })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'El teléfono debe tener al menos 10 caracteres' })
  @Matches(/^\+\d{1,4}\d{7,15}$/, { message: 'El teléfono debe tener formato internacional: +[código][número] (ej: +525512345678)' })
  @ApiProperty({ example: '+525512345678', required: false })
  telefono?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Calle Principal #123, Col. Centro', required: false })
  direccion?: string;
}
