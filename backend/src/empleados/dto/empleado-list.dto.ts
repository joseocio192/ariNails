import { IsOptional, IsString, IsNumber, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para cada item de empleado en la lista
 */
export class EmpleadoListItemDto {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  direccion: string;
  ultimaSesion: Date | null;
  citasCompletadas: number;
  citasCanceladas: number;
  totalCitas: number;
  estaActivo: boolean;
  fechaCreacion: Date;
}

/**
 * DTO para la respuesta paginada de empleados
 */
export class EmpleadoListResponseDto {
  data: EmpleadoListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO para los query params de búsqueda
 */
export class GetEmpleadosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['nombreCompleto', 'email', 'telefono', 'ultimaSesion', 'totalCitas', 'fechaCreacion'])
  sortBy?: string = 'fechaCreacion';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  estaActivo?: boolean;
}
