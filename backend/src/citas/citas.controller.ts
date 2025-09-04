import { Controller, Get, Query} from '@nestjs/common';
import { CitasService } from './citas.service';
import { ApiTags } from '@nestjs/swagger';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('citas')
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}
  @Get('/disponibles')
  async obtenerCitasDisponibles(@Query('month') month: string, @Query('year') year: string, @Query('empleadoid') empleadoid?: number) {
    const data = await this.citasService.obtenerCitasDisponibles(month, year, empleadoid);
    return IResponse(data, 'Citas disponibles obtenidas exitosamente', true);
  }
}