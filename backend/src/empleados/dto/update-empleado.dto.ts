import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

/**
 * DTO para actualizar datos del empleado
 */
export class UpdateEmpleadoDto {
  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  apellidoPaterno?: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

/**
 * DTO para habilitar/deshabilitar empleado
 */
export class ToggleEmpleadoStatusDto {
  @IsBoolean()
  estaActivo: boolean;
}
