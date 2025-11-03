import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../utils/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Iniciar sesión en el sistema' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@GetUser() user) {
    const loginResult = await this.authService.login(user);
    console.log(
      '🔑 Login successful for user:',
      loginResult.user.usuario,
      'with role:',
      loginResult.user.rol.nombre,
    );
    return IResponse(loginResult, 'Login exitoso', true);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async getProfile(@Request() req) {
    // Obtener el perfil actualizado desde la base de datos
    const usuario = await this.usuarioService.getProfileById(req.user.userId);
    
    // Construir el objeto de respuesta con telefono y direccion
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
    
    return IResponse(profile, 'Perfil obtenido exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(@Request() _req) {
    return IResponse({}, 'Cierre de sesión exitoso', true);
  }
}
