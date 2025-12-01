import {
  Controller,
  Get,
  Query,
  UseGuards,
  Put,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Post,
  HttpCode,
  HttpStatus,
  Delete,
  Request,
} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  GetEmpleadosQueryDto,
  EmpleadoListResponseDto,
} from './dto/empleado-list.dto';
import {
  UpdateEmpleadoDto,
  ToggleEmpleadoStatusDto,
} from './dto/update-empleado.dto';
import {
  GetAvailableUsersQueryDto,
  AvailableUsersResponseDto,
} from './dto/available-users.dto';
import { PromoteToEmpleadoDto } from './dto/promote-empleado.dto';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: 'Obtener lista paginada de empleados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empleados obtenida exitosamente',
    type: EmpleadoListResponseDto,
  })
  async findAll(@Query() query: GetEmpleadosQueryDto) {
    const data = await this.empleadosService.findAll(query);
    return IResponse(data, 'Empleados obtenidos exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('available-users')
  @ApiOperation({
    summary: 'Obtener usuarios disponibles para convertir en empleados',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios disponibles obtenidos exitosamente',
    type: AvailableUsersResponseDto,
  })
  async findAvailableUsers(@Query() query: GetAvailableUsersQueryDto) {
    const data = await this.empleadosService.findAvailableUsers(query);
    return IResponse(data, 'Usuarios disponibles obtenidos exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Empleado obtenido exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.empleadosService.findOne(id);
    return IResponse(data, 'Empleado obtenido exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: 'number' })
  @ApiBody({ type: UpdateEmpleadoDto })
  @ApiResponse({
    status: 200,
    description: 'Empleado actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
  ) {
    const data = await this.empleadosService.update(id, updateEmpleadoDto);
    return IResponse(data, 'Empleado actualizado exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Habilitar o deshabilitar empleado' })
  @ApiParam({ name: 'id', description: 'ID del empleado', type: 'number' })
  @ApiBody({ type: ToggleEmpleadoStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Estado del empleado actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleStatusDto: ToggleEmpleadoStatusDto,
  ) {
    const data = await this.empleadosService.toggleStatus(id, toggleStatusDto);
    return IResponse(
      data,
      'Estado del empleado actualizado exitosamente',
      true,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener empleados con filtros opcionales' })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'ID del empleado específico',
    type: 'number',
  })
  @ApiQuery({
    name: 'employeeName',
    required: false,
    description: 'Nombre del empleado para búsqueda',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'Empleados obtenidos exitosamente' })
  async find(
    @Query('employeeId') employeeId?: number,
    @Query('employeeName') employeeName?: string,
  ) {
    const data = await this.empleadosService.find(employeeId, employeeName);
    return IResponse(data, 'Empleados obtenidos exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':usuarioId/promote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Promover usuario a empleado' })
  @ApiParam({
    name: 'usuarioId',
    description: 'ID del usuario a promover',
    type: 'number',
  })
  @ApiBody({ type: PromoteToEmpleadoDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario promovido a empleado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya es empleado o es administrador',
  })
  async promoteToEmpleado(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() promoteDto: PromoteToEmpleadoDto,
    @Request() req: any,
  ) {
    const currentUserId = req.user?.userId || req.user?.id;
    const data = await this.empleadosService.promoteToEmpleado(
      usuarioId,
      promoteDto,
      currentUserId,
    );
    return IResponse(data, 'Usuario promovido a empleado exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/demote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Degradar empleado a cliente' })
  @ApiParam({
    name: 'id',
    description: 'ID del empleado a degradar',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Empleado degradado a cliente exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'El empleado tiene citas pendientes',
  })
  async demoteToCliente(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const currentUserId = req.user?.userId || req.user?.id;
    await this.empleadosService.demoteToCliente(id, currentUserId);
    return IResponse(null, 'Empleado degradado a cliente exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('repair-records')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reparar registros de empleados faltantes',
    description: 'Crea registros en la tabla Empleado para usuarios que tienen rol empleado pero no tienen el registro correspondiente'
  })
  @ApiResponse({
    status: 200,
    description: 'Registros reparados exitosamente',
    schema: {
      example: {
        data: {
          fixed: 1,
          details: ['Usuario 8 (Juan Pérez) - Registro de empleado creado']
        },
        message: 'Se repararon 1 registros de empleados',
        success: true
      }
    }
  })
  async repairEmpleadoRecords(@Request() req: any) {
    const currentUserId = req.user?.userId || req.user?.id;
    const result = await this.empleadosService.repairEmpleadoRecords(currentUserId);
    return IResponse(
      result,
      `Se repararon ${result.fixed} registros de empleados`,
      true
    );
  }
}
