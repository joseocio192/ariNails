import { Controller, Post, Body, Put, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('usuarios')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/cliente')
  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateUsuarioDto })
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario =
      await this.usuarioService.registerUsuarioCliente(createUsuarioDto);
    return IResponse(usuario, 'cliente registrado exitosamente', true);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('/cliente')
  @ApiOperation({ summary: 'Actualizar datos de cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiBody({ type: UpdateUsuarioDto })
  async update(@Body() updateUsuarioDto: UpdateUsuarioDto) {
    const usuario =
      await this.usuarioService.updateUsuarioCliente(updateUsuarioDto);
    return IResponse(usuario, 'cliente actualizado exitosamente', true);
  }
}
