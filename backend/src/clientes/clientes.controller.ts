import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ClienteListResponseDto,
  GetClientesQueryDto,
} from './dto/cliente-list.dto';
import { UpdateClienteDto, ToggleClienteStatusDto } from './dto/update-cliente.dto';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de clientes con búsqueda' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
    type: ClienteListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'estaActivo', required: false, type: Boolean })
  async findAll(@Query() query: GetClientesQueryDto) {
    const result = await this.clientesService.findAll(query);
    return IResponse(result, 'Clientes obtenidos exitosamente', true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.clientesService.findOne(id);
    return IResponse(cliente, 'Cliente obtenido exitosamente', true);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 400, description: 'Email ya está en uso' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    const cliente = await this.clientesService.update(id, updateClienteDto);
    return IResponse(cliente, 'Cliente actualizado exitosamente', true);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Habilitar o deshabilitar cuenta del cliente' })
  @ApiResponse({
    status: 200,
    description: 'Estado del cliente actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiParam({ name: 'id', type: Number })
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleStatusDto: ToggleClienteStatusDto,
  ) {
    const cliente = await this.clientesService.toggleStatus(
      id,
      toggleStatusDto,
    );
    return IResponse(
      cliente,
      `Cliente ${toggleStatusDto.estaActivo ? 'habilitado' : 'deshabilitado'} exitosamente`,
      true,
    );
  }
}
