
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return IResponse(this.authService.login(req.user),'Registrado exitosamente',true);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return IResponse(req.user, 'Perfil obtenido exitosamente', true);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return IResponse(req.logout(), 'Cierre de sesión exitoso', true);
  }
}
