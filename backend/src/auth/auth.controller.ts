
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    console.log('🔑 Login successful, token generated:', token.substring(0, 20) + '...');
    return IResponse(token, 'Login exitoso', true);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return IResponse(req.user, 'Perfil obtenido exitosamente', true);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(@Request() _req) {
    return IResponse({}, 'Cierre de sesión exitoso', true);
  }
}
