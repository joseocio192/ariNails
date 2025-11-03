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
      
      // Intentar buscar el usuario
      try {
        if (username.includes('@')) {
          user = await this.usersService.findOneWithEmail(username);
        } else {
          user = await this.usersService.findOneWithUsername(
            username.trim().toLowerCase(),
          );
        }
      } catch (error) {
        // Si el usuario no se encuentra, lanzar un error específico
        if (error instanceof NotFoundException) {
          throw new NotFoundException('El usuario no existe');
        }
        throw error;
      }
      
      // Validar la contraseña
      if (user && (await user.validatePassword(password))) {
        const { password, ...result } = user;
        return result;
      }
      
      // Si llegamos aquí, la contraseña es incorrecta
      throw new UnauthorizedException('La contraseña es incorrecta');
    } catch (error) {
      // Re-lanzar errores específicos
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el usuario');
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

      // Obtener telefono y direccion del cliente
      const telefono =
        user.clientes && user.clientes.length > 0
          ? user.clientes[0].telefono
          : null;
      const direccion =
        user.clientes && user.clientes.length > 0
          ? user.clientes[0].direccion
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
      
      // Retornar el token junto con información del usuario
      return {
        token: accessToken,
        user: {
          id: user.id,
          usuario: user.usuario,
          email: user.email,
          nombres: user.nombres,
          apellidoPaterno: user.apellidoPaterno,
          apellidoMaterno: user.apellidoMaterno,
          nombresCompletos: `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno || ''}`.trim(),
          rol: {
            id: user.rol_id,
            nombre: user.rol?.nombre,
            descripcion: user.rol?.descripcion,
          },
          clienteId: clienteId,
          empleadoId: empleadoId,
          telefono: telefono,
          direccion: direccion,
          clientes: user.clientes || [],
        }
      };
    } catch (error) {
      throw new Error('Failed to login');
    }
  }
}
