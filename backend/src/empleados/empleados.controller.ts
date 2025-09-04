import { Controller, Get, Query} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
const IResponse = require('./utils/IResponse.handle');

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  async find(@Query('employeeId') employeeId?: number, @Query('employeeName') employeeName?: string) {
    const data = await this.empleadosService.find(employeeId, employeeName);
    return IResponse(data, 'Empleados obtenidos exitosamente', true);
  }
}
