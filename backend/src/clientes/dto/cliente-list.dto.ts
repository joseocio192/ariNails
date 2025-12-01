import { ApiProperty } from '@nestjs/swagger';

export class ClienteListItemDto {
  @ApiProperty({ description: 'ID del cliente' })
  id: number;

  @ApiProperty({ description: 'ID del usuario asociado' })
  usuarioId: number;

  @ApiProperty({ description: 'Nombre completo del cliente' })
  nombreCompleto: string;

  @ApiProperty({ description: 'Email del cliente' })
  email: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  telefono: string;

  @ApiProperty({ description: 'Dirección del cliente', required: false })
  direccion?: string;

  @ApiProperty({ description: 'Última sesión del cliente', required: false })
  ultimaSesion?: Date;

  @ApiProperty({ description: 'Número de citas completadas' })
  citasCompletadas: number;

  @ApiProperty({ description: 'Número de citas canceladas' })
  citasCanceladas: number;

  @ApiProperty({ description: 'Total de citas' })
  totalCitas: number;

  @ApiProperty({ description: 'Estado de la cuenta (activo/inactivo)' })
  estaActivo: boolean;

  @ApiProperty({ description: 'Fecha de creación de la cuenta' })
  fechaCreacion: Date;
}

export class ClienteListResponseDto {
  @ApiProperty({ type: [ClienteListItemDto], description: 'Lista de clientes' })
  data: ClienteListItemDto[];

  @ApiProperty({ description: 'Total de registros' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Registros por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

export class GetClientesQueryDto {
  @ApiProperty({ description: 'Página actual', required: false, default: 1 })
  page?: number;

  @ApiProperty({ description: 'Registros por página', required: false, default: 10 })
  limit?: number;

  @ApiProperty({ description: 'Búsqueda por nombre, email o teléfono', required: false })
  search?: string;

  @ApiProperty({ description: 'Ordenar por campo', required: false, default: 'fechaCreacion' })
  sortBy?: string;

  @ApiProperty({ description: 'Orden ascendente o descendente', required: false, default: 'DESC' })
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ description: 'Filtrar por estado activo', required: false })
  estaActivo?: boolean;
}
