import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UpdateClienteDto {
  @ApiProperty({ description: 'Nombres del cliente', required: false })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiProperty({ description: 'Apellido paterno del cliente', required: false })
  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @ApiProperty({ description: 'Apellido materno del cliente', required: false })
  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @ApiProperty({ description: 'Email del cliente', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Teléfono del cliente', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ description: 'Dirección del cliente', required: false })
  @IsOptional()
  @IsString()
  direccion?: string;
}

export class ToggleClienteStatusDto {
  @ApiProperty({ description: 'Estado activo del cliente' })
  @IsBoolean()
  estaActivo: boolean;
}
