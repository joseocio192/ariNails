import { Controller, Get, Post, Put, Query, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { CitasService } from './citas.service';
import type { CrearCitaDto } from './citas.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async crearCita(@Body() crearCitaDto: CrearCitaDto) {
    const data = await this.citasService.crearCita(crearCitaDto);
    return IResponse(data, 'Cita creada exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/empleado/:empleadoId')
  async obtenerCitasEmpleado(
    @Param('empleadoId') empleadoId: number,
    @Query('fecha') fecha?: string
  ) {
    const data = await this.citasService.obtenerCitasEmpleado(empleadoId, fecha);
    return IResponse(data, 'Citas del empleado obtenidas exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/cliente/:clienteId')
  async obtenerCitasCliente(@Param('clienteId') clienteId: number) {
    const data = await this.citasService.obtenerCitasCliente(clienteId);
    return IResponse(data, 'Citas del cliente obtenidas exitosamente', true);
  }
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:citaId')
  async cancelarCita(
    @Param('citaId') citaId: number,
    @Body() body: { motivo: string }
  ) {
    const data = await this.citasService.cancelarCita(citaId, body.motivo);
    return IResponse(data, 'Cita cancelada exitosamente', true);
  }
}