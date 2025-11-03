import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Param,
  Body,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('citas')
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get('/disponibles')
  @ApiOperation({ summary: 'Obtener citas disponibles por mes y año' })
  @ApiQuery({ name: 'month', description: 'Mes en formato MM', example: '12' })
  @ApiQuery({
    name: 'year',
    description: 'Año en formato YYYY',
    example: '2024',
  })
  @ApiQuery({
    name: 'empleadoid',
    required: false,
    description: 'ID del empleado específico',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Citas disponibles obtenidas exitosamente',
  })
  async obtenerCitasDisponibles(
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('empleadoid') empleadoid?: number,
  ) {
    const data = await this.citasService.obtenerCitasDisponibles(
      month,
      year,
      empleadoid,
    );
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
  @ApiOperation({ summary: 'Obtener citas de un empleado específico' })
  @ApiParam({
    name: 'empleadoId',
    description: 'ID del empleado',
    type: 'number',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha específica en formato YYYY-MM-DD',
    example: '2024-12-20',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fecha de fin del rango (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Citas del empleado obtenidas exitosamente',
  })
  async obtenerCitasEmpleado(
    @Param('empleadoId') empleadoId: number,
    @Query('fecha') fecha?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const data = await this.citasService.obtenerCitasEmpleado(
      empleadoId,
      fecha,
      fechaInicio,
      fechaFin,
    );
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
  @Post('/:citaId/cancelar')
  @ApiOperation({ summary: 'Cancelar o reagendar una cita' })
  @ApiParam({ name: 'citaId', description: 'ID de la cita a cancelar/reagendar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: { type: 'string', description: 'Motivo de la cancelación/reagendado' },
        realizarReembolso: { type: 'boolean', description: 'Si se debe reembolsar al cliente' },
        nuevaFecha: { type: 'string', description: 'Nueva fecha para reagendar (YYYY-MM-DD)' },
        nuevaHora: { type: 'string', description: 'Nueva hora para reagendar (HH:mm)' },
      },
      required: ['motivo', 'realizarReembolso'],
    },
  })
  async cancelarOReagendarCita(
    @Param('citaId', ParseIntPipe) citaId: number,
    @Body() body: { 
      motivo: string;
      realizarReembolso: boolean;
      nuevaFecha?: string;
      nuevaHora?: string;
    },
  ) {
    const data = await this.citasService.cancelarOReagendarCita(
      citaId,
      body.motivo,
      body.realizarReembolso,
      body.nuevaFecha,
      body.nuevaHora,
    );
    
    const mensaje = body.realizarReembolso 
      ? 'Cita cancelada y reembolso procesado exitosamente'
      : 'Cita reagendada exitosamente';
    
    return IResponse(data, mensaje, true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:citaId')
  async cancelarCita(
    @Param('citaId') citaId: number,
    @Body() body: { motivo: string },
  ) {
    const data = await this.citasService.cancelarCita(citaId, body.motivo);
    return IResponse(data, 'Cita cancelada exitosamente', true);
  }

  // Endpoints específicos para administradores
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/admin/todas')
  @ApiOperation({ summary: 'Obtener todas las citas (Solo admin)' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Filtrar por fecha específica (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fecha de fin del rango (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Citas obtenidas exitosamente' })
  async obtenerTodasLasCitas(
    @Query('fecha') fecha?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const data = await this.citasService.obtenerTodasLasCitas(
      fecha,
      fechaInicio,
      fechaFin,
    );
    return IResponse(data, 'Todas las citas obtenidas exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/admin/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de citas (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async obtenerEstadisticasCitas() {
    const data = await this.citasService.obtenerEstadisticasCitas();
    return IResponse(
      data,
      'Estadísticas de citas obtenidas exitosamente',
      true,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('/admin/:citaId/estado')
  @ApiOperation({ summary: 'Actualizar estado de una cita (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Estado de cita actualizado exitosamente',
  })
  async actualizarEstadoCita(
    @Param('citaId', ParseIntPipe) citaId: number,
    @Body() body: { estado: 'completada' | 'cancelada'; motivo?: string },
  ) {
    const data = await this.citasService.actualizarEstadoCita(
      citaId,
      body.estado,
      body.motivo,
    );
    return IResponse(data, 'Estado de cita actualizado exitosamente', true);
  }
}
