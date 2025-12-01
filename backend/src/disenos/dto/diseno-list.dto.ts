import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDisenosQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (titulo o descripción)',
    example: 'floral',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    example: 'fechaCreacion',
    enum: ['titulo', 'fechaCreacion'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['titulo', 'fechaCreacion'])
  sortBy?: 'titulo' | 'fechaCreacion' = 'fechaCreacion';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class DisenoListItemDto {
  id: number;
  titulo: string;
  imagenUrl: string;
  descripcion?: string;
  empleadoIdCreador: number;
  nombreEmpleado: string;
  fechaCreacion: Date;
  estaActivo: boolean;
}

export class DisenosResponseDto {
  data: DisenoListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
