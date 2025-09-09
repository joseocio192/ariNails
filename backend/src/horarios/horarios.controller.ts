import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import type { ConfiguracionHorario, CrearHorarioDto } from './horarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const responseHandler = require('../utils/IResponse.handle');

@ApiTags('Horarios')
@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get('disponibles/:fecha')
  @UseGuards(JwtAuthGuard)
  async obtenerHorariosDisponibles(@Param('fecha') fecha: string) {
    try {
      const horarios = await this.horariosService.obtenerHorariosDisponibles(fecha);
      return responseHandler(horarios, 'Horarios disponibles obtenidos correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al obtener horarios disponibles: ' + error.message, false);
    }
  }


  @ApiBearerAuth()
  @Get('activo/:fecha')
  @UseGuards(JwtAuthGuard)
  async verificarDiaActivo(@Param('fecha') fecha: string) {
    try {
      const activo = await this.horariosService.verificarDiaActivo(fecha);
      return responseHandler(activo, 'Verificación de día activo completada', true);
    } catch (error) {
      return responseHandler({}, 'Error al verificar día activo: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Post('configurar')
  @UseGuards(JwtAuthGuard)
  async configurarHorarios(@Body() configuraciones: ConfiguracionHorario[]) {
    try {
      await this.horariosService.configurarHorarioEmpleado(configuraciones);
      return responseHandler({}, 'Horarios configurados correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al configurar horarios: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Get('empleado/:empleadoId')
  @UseGuards(JwtAuthGuard)
  async obtenerHorariosEmpleado(@Param('empleadoId') empleadoId: number) {
    try {
      const horarios = await this.horariosService.obtenerHorariosEmpleado(empleadoId);
      return responseHandler(horarios, 'Horarios del empleado obtenidos correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al obtener horarios del empleado: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Get('empleado/:empleadoId/detallado')
  @UseGuards(JwtAuthGuard)
  async obtenerHorariosEmpleadoDetallado(
    @Param('empleadoId') empleadoId: number,
    @Query('fecha') fecha?: string
  ) {
    try {
      const horarios = await this.horariosService.obtenerHorariosEmpleadoDetallado(empleadoId, fecha);
      return responseHandler(horarios, 'Horarios detallados del empleado obtenidos correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al obtener horarios detallados del empleado: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Post('empleado/crear')
  @UseGuards(JwtAuthGuard)
  async crearHorarioEmpleado(@Body() crearHorarioDto: CrearHorarioDto) {
    try {
      const horario = await this.horariosService.crearHorarioEmpleado(crearHorarioDto);
      return responseHandler(horario, 'Horario creado correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al crear horario: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Delete('empleado/:empleadoId/horario/:horarioId')
  @UseGuards(JwtAuthGuard)
  async eliminarHorarioEmpleado(
    @Param('empleadoId') empleadoId: number,
    @Param('horarioId') horarioId: number
  ) {
    try {
      await this.horariosService.eliminarHorarioEmpleado(horarioId, empleadoId);
      return responseHandler({}, 'Horario eliminado correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al eliminar horario: ' + error.message, false);
    }
  }

  @ApiBearerAuth()
  @Post('inicializar')
  async crearHorariosIniciales() {
    try {
      await this.horariosService.crearHorariosIniciales();
      return responseHandler({}, 'Horarios iniciales creados correctamente', true);
    } catch (error) {
      return responseHandler({}, 'Error al crear horarios iniciales: ' + error.message, false);
    }
  }
}
