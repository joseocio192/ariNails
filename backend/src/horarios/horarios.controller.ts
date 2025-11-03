import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import {
  ConfiguracionHorarioDto,
  CrearHorarioDto,
  BloquearDiaDto,
  HabilitarDiaDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

const responseHandler = require('../utils/IResponse.handle');

@ApiTags('Horarios')
@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get('disponibles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener horarios disponibles para una fecha específica',
  })
  @ApiQuery({
    name: 'fecha',
    description: 'Fecha en formato YYYY-MM-DD',
    example: '2024-12-20',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios disponibles obtenidos correctamente',
  })
  async obtenerHorariosDisponibles(@Query('fecha') fecha: string) {
    const horarios =
      await this.horariosService.obtenerHorariosDisponibles(fecha);
    return responseHandler(
      horarios,
      'Horarios disponibles obtenidos correctamente',
      true,
    );
  }

  @ApiBearerAuth()
  @Get('activo/:fecha')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verificar si un día está activo para citas' })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha a verificar en formato YYYY-MM-DD',
    example: '2024-12-20',
  })
  @ApiResponse({
    status: 200,
    description: 'Verificación de día activo completada',
  })
  async verificarDiaActivo(@Param('fecha') fecha: string) {
    const activo = await this.horariosService.verificarDiaActivo(fecha);
    return responseHandler(
      activo,
      'Verificación de día activo completada',
      true,
    );
  }

  @ApiBearerAuth()
  @Post('configurar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Configurar horarios de empleado' })
  @ApiResponse({
    status: 200,
    description: 'Horarios configurados correctamente',
  })
  @ApiBody({ type: [ConfiguracionHorarioDto] })
  async configurarHorarios(@Body() configuraciones: ConfiguracionHorarioDto[]) {
    await this.horariosService.configurarHorarioEmpleado(configuraciones);
    return responseHandler({}, 'Horarios configurados correctamente', true);
  }

  @ApiBearerAuth()
  @Get('empleado/:empleadoId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener horarios de un empleado específico' })
  @ApiParam({
    name: 'empleadoId',
    description: 'ID del empleado',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios del empleado obtenidos correctamente',
  })
  async obtenerHorariosEmpleado(@Param('empleadoId') empleadoId: number) {
    const horarios =
      await this.horariosService.obtenerHorariosEmpleado(empleadoId);
    return responseHandler(
      horarios,
      'Horarios del empleado obtenidos correctamente',
      true,
    );
  }

  @ApiBearerAuth()
  @Get('empleado/:empleadoId/detallado')
  @UseGuards(JwtAuthGuard)
  async obtenerHorariosEmpleadoDetallado(
    @Param('empleadoId') empleadoId: number,
    @Query('fecha') fecha?: string,
  ) {
    const horarios =
      await this.horariosService.obtenerHorariosEmpleadoDetallado(
        empleadoId,
        fecha,
      );
    return responseHandler(
      horarios,
      'Horarios detallados del empleado obtenidos correctamente',
      true,
    );
  }

  @ApiBearerAuth()
  @Post('empleado/crear')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo horario para empleado' })
  @ApiResponse({ status: 201, description: 'Horario creado correctamente' })
  @ApiBody({ type: CrearHorarioDto })
  async crearHorarioEmpleado(@Body() crearHorarioDto: CrearHorarioDto) {
    const horario =
      await this.horariosService.crearHorarioEmpleado(crearHorarioDto);
    return responseHandler(horario, 'Horario creado correctamente', true);
  }

  @ApiBearerAuth()
  @Delete('empleado/:empleadoId/horario/:horarioId')
  @UseGuards(JwtAuthGuard)
  async eliminarHorarioEmpleado(
    @Param('empleadoId') empleadoId: number,
    @Param('horarioId') horarioId: number,
  ) {
    await this.horariosService.eliminarHorarioEmpleado(horarioId, empleadoId);
    return responseHandler({}, 'Horario eliminado correctamente', true);
  }

  @ApiBearerAuth()
  @Post('inicializar')
  async crearHorariosIniciales() {
    await this.horariosService.crearHorariosIniciales();
    return responseHandler(
      {},
      'Horarios iniciales creados correctamente',
      true,
    );
  }

  // Endpoints específicos para administradores - gestión de calendario
  @ApiBearerAuth()
  @Post('admin/bloquear/:horarioId')
  @UseGuards(JwtAuthGuard)
  async bloquearHorario(@Param('horarioId') horarioId: number) {
    const horario = await this.horariosService.bloquearHorario(horarioId);
    return responseHandler(horario, 'Horario bloqueado correctamente', true);
  }

  @ApiBearerAuth()
  @Post('admin/habilitar/:horarioId')
  @UseGuards(JwtAuthGuard)
  async habilitarHorario(@Param('horarioId') horarioId: number) {
    const horario = await this.horariosService.habilitarHorario(horarioId);
    return responseHandler(horario, 'Horario habilitado correctamente', true);
  }

  @ApiBearerAuth()
  @Post('admin/bloquear-dia')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bloquear un día completo (administrador)' })
  @ApiResponse({ status: 200, description: 'Día bloqueado correctamente' })
  @ApiBody({ type: BloquearDiaDto })
  async bloquearDiaCompleto(@Body() body: BloquearDiaDto) {
    await this.horariosService.bloquearDiaCompleto(body.fecha, body.empleadoId);
    return responseHandler({}, 'Día bloqueado correctamente', true);
  }

  @ApiBearerAuth()
  @Post('admin/habilitar-dia')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Habilitar un día completo (administrador)' })
  @ApiResponse({ status: 200, description: 'Día habilitado correctamente' })
  @ApiBody({ type: HabilitarDiaDto })
  async habilitarDiaCompleto(@Body() body: HabilitarDiaDto) {
    await this.horariosService.habilitarDiaCompleto(
      body.fecha,
      body.empleadoId,
    );
    return responseHandler({}, 'Día habilitado correctamente', true);
  }

  @ApiBearerAuth()
  @Get('admin/calendario')
  @UseGuards(JwtAuthGuard)
  async obtenerEstadoCalendario(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    const calendario = await this.horariosService.obtenerEstadoCalendario(
      fechaInicio,
      fechaFin,
    );
    return responseHandler(
      calendario,
      'Estado del calendario obtenido correctamente',
      true,
    );
  }
}
