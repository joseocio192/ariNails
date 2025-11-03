import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      return user;
    } catch (error) {
      // Propagar errores específicos
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(error.message); // "El usuario no existe"
      }
      if (error instanceof UnauthorizedException) {
        throw error; // "La contraseña es incorrecta" u otro mensaje
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el usuario');
    }
  }
}
