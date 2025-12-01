import { IsOptional, IsString } from 'class-validator';

export class AvailableUserDto {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  nombreCompleto: string;
}

export class GetAvailableUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class AvailableUsersResponseDto {
  data: AvailableUserDto[];
  total: number;
}
