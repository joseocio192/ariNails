import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class BloquearDiaDto {
  @ApiProperty({
    description: 'Fecha a bloquear en formato YYYY-MM-DD',
    example: '2024-12-20',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description:
      'ID del empleado específico (opcional, si no se proporciona bloquea para todos)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  empleadoId?: number;
}

export class HabilitarDiaDto {
  @ApiProperty({
    description: 'Fecha a habilitar en formato YYYY-MM-DD',
    example: '2024-12-20',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description:
      'ID del empleado específico (opcional, si no se proporciona habilita para todos)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  empleadoId?: number;
}
