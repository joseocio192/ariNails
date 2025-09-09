import { Controller, Get, Query, UseGuards} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener empleados con filtros opcionales' })
  @ApiQuery({ name: 'employeeId', required: false, description: 'ID del empleado específico', type: 'number' })
  @ApiQuery({ name: 'employeeName', required: false, description: 'Nombre del empleado para búsqueda', type: 'string' })
  @ApiResponse({ status: 200, description: 'Empleados obtenidos exitosamente' })
  async find(@Query('employeeId') employeeId?: number, @Query('employeeName') employeeName?: string) {
    const data = await this.empleadosService.find(employeeId, employeeName);
    return IResponse(data, 'Empleados obtenidos exitosamente', true);
  }
}
