import { Controller, Get, Query} from '@nestjs/common';
import { CitasService } from './citas.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('citas')
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}
  @Get('/disponibles')
  async obtenerCitasDisponibles(@Query('month') month: string, @Query('year') year: string, @Query('empleadoid') empleadoid?: number) {
    return this.citasService.obtenerCitasDisponibles(month, year, empleadoid);
  }
}