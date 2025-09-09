import { Controller, Get, Query, UseGuards} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');
@ApiTags('Empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async find(@Query('employeeId') employeeId?: number, @Query('employeeName') employeeName?: string) {
    const data = await this.empleadosService.find(employeeId, employeeName);
    return IResponse(data, 'Empleados obtenidos exitosamente', true);
  }
}
