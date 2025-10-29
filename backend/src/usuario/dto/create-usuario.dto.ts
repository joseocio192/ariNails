import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

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
  @ApiProperty({ example: 'password123' })
  password: string;
}

export class UpdateUsuarioDto extends CreateUsuarioDto {
  @IsNumber()
  id: number;
}
