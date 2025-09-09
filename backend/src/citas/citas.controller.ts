import { Controller, Get, Post, Put, Query, Param, Body, UseGuards, Delete, ParseIntPipe } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Crear una nueva cita' })
  @ApiResponse({ status: 201, description: 'Cita creada exitosamente' })
  @ApiBody({ type: CreateCitaDto })
  async crearCita(@Body() crearCitaDto: CreateCitaDto) {
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

  // Endpoints específicos para administradores
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/admin/todas')
  @ApiOperation({ summary: 'Obtener todas las citas (Solo admin)' })
  @ApiQuery({ name: 'fecha', required: false, description: 'Filtrar por fecha específica (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Citas obtenidas exitosamente' })
  async obtenerTodasLasCitas(@Query('fecha') fecha?: string) {
    try {
      const data = await this.citasService.obtenerTodasLasCitas(fecha);
      return IResponse(data, 'Todas las citas obtenidas exitosamente', true);
    } catch (error) {
      return IResponse({}, error.message, false);
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/admin/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de citas (Solo admin)' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticasCitas() {
    try {
      const data = await this.citasService.obtenerEstadisticasCitas();
      return IResponse(data, 'Estadísticas de citas obtenidas exitosamente', true);
    } catch (error) {
      return IResponse({}, error.message, false);
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/admin/:citaId/estado')
  @ApiOperation({ summary: 'Actualizar estado de una cita (Solo admin)' })
  @ApiResponse({ status: 200, description: 'Estado de cita actualizado exitosamente' })
  async actualizarEstadoCita(
    @Param('citaId', ParseIntPipe) citaId: number,
    @Body() body: { estado: 'completada' | 'cancelada'; motivo?: string }
  ) {
    try {
      const data = await this.citasService.actualizarEstadoCita(citaId, body.estado, body.motivo);
      return IResponse(data, 'Estado de cita actualizado exitosamente', true);
    } catch (error) {
      return IResponse({}, error.message, false);
    }
  }
}