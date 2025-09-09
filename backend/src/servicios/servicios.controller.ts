import { Controller, Get } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ApiTags } from '@nestjs/swagger';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  findAll() {
    const data = this.serviciosService.findAll();
    return IResponse(data, 'Servicios obtenidos exitosamente', true);
  }
}
