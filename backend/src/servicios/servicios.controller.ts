import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('servicios')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios obtenida exitosamente',
  })
  async findAll() {
    const data = await this.serviciosService.findAll();
    return IResponse(data, 'Servicios obtenidos exitosamente', true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.findOne(id);
    return IResponse(data, 'Servicio obtenido exitosamente', true);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio (Solo admin)' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createServicioDto: CreateServicioDto) {
    const data = await this.serviciosService.create(createServicioDto);
    return IResponse(data, 'Servicio creado exitosamente', true);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un servicio (Solo admin)' })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    const data = await this.serviciosService.update(id, updateServicioDto);
    return IResponse(data, 'Servicio actualizado exitosamente', true);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un servicio (Solo admin)' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.remove(id);
    return IResponse(data, 'Servicio eliminado exitosamente', true);
  }
}
