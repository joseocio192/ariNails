import { Controller, Get, Query} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  async find(@Query('employeeId') employeeId?: number, @Query('employeeName') employeeName?: string) {
    return this.empleadosService.find(employeeId, employeeName);
  }
}
