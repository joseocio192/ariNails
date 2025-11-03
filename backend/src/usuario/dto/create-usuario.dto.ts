import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, Matches, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @ApiProperty({ example: 'Juan Carlos' })
  nombres: string;

  @IsString()
  @ApiProperty({ example: 'Pérez' })
  apellidoPaterno: string;

  @IsString()
  @ApiProperty({ example: 'Gonzalez' })
  apellidoMaterno: string;

  @IsString()
  @ApiProperty({ example: 'juancarlos' })
  usuario: string;

  @IsEmail()
  @ApiProperty({ example: 'juancarlos@example.com' })
  email: string;

  @IsString()
  @MinLength(10, { message: 'El teléfono debe tener al menos 10 caracteres' })
  @Matches(/^\+\d{1,4}\d{7,15}$/, { message: 'El teléfono debe tener formato internacional: +[código][número] (ej: +525512345678)' })
  @ApiProperty({ example: '+525512345678', description: 'Teléfono con código de país (formato internacional)' })
  telefono: string;

  @IsString()
  @ApiProperty({ example: 'password123' })
  password: string;
}

export class UpdateUsuarioDto extends CreateUsuarioDto {
  @IsNumber()
  id: number;
}
