import { Controller, Post, Body, Put, UseGuards, Patch, Request } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('/profile')
  @ApiOperation({ summary: 'Actualizar perfil del usuario (email, teléfono, dirección)' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Email o teléfono ya está en uso' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.userId;
    const usuario = await this.usuarioService.updateProfile(userId, updateProfileDto);
    
    // Construir el objeto de respuesta igual que en GET /profile
    const profile = {
      id: usuario.id,
      usuario: usuario.usuario,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      nombresCompletos: `${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`.trim(),
      rol: {
        id: usuario.rol_id,
        nombre: usuario.rol?.nombre,
        descripcion: usuario.rol?.descripcion,
      },
      clienteId: usuario.clientes && usuario.clientes.length > 0 ? usuario.clientes[0].id : null,
      empleadoId: usuario.empleados && usuario.empleados.length > 0 ? usuario.empleados[0].id : null,
      telefono: usuario.clientes && usuario.clientes.length > 0 ? usuario.clientes[0].telefono : null,
      direccion: usuario.clientes && usuario.clientes.length > 0 ? usuario.clientes[0].direccion : null,
      clientes: usuario.clientes || [],
    };
    
    return IResponse(profile, 'Perfil actualizado exitosamente', true);
  }
}
