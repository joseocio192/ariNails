import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      let user: Usuario;
      if (username.includes('@')) {
        user = await this.usersService.findOneWithEmail(username);
      } else {
        user = await this.usersService.findOneWithUsername(
          username.trim().toLowerCase(),
        );
      }
      if (user && (await user.validatePassword(password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  async login(user: any) {
    try {
      // Obtener información del cliente si existe
      const clienteId =
        user.clientes && user.clientes.length > 0 ? user.clientes[0].id : null;
      const empleadoId =
        user.empleados && user.empleados.length > 0
          ? user.empleados[0].id
          : null;

      const payload = {
        username: user.usuario,
        sub: user.id,
        email: user.email,
        nombres: user.nombres,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        rolId: user.rol_id,
        rolNombre: user.rol?.nombre,
        rolDescripcion: user.rol?.descripcion,
        clienteId: clienteId,
        empleadoId: empleadoId,
      };
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    } catch (error) {
      throw new Error('Failed to login');
    }
  }
}
