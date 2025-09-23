
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../utils/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBearerAuth()
  @ApiBody({ type: LoginDto })
  async login(@GetUser() user) {
    const token = await this.authService.login(user);
    console.log('🔑 Login successful, token generated:', token.substring(0, 20) + '...');
    return IResponse(token, 'Login exitoso', true);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return IResponse(req.user, 'Perfil obtenido exitosamente', true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(@Request() _req) {
    return IResponse({}, 'Cierre de sesión exitoso', true);
  }
}
