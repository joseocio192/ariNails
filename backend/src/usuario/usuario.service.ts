import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * Register a new usuario
   * @param createUsuarioDto - The data transfer object containing usuario details
   * @returns The newly created usuario
   */
  async registerUsuarioCliente(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    try {
      const existingUsuario = await this.usuarioRepository.findOne({
        where: [
          { email: createUsuarioDto.email },
          { usuario: createUsuarioDto.usuario },
        ],
      });
      if (existingUsuario) {
        throw new ConflictException('Usuario already exists');
      }
      const usuarioSanitizado = {
        ...createUsuarioDto,
        rol: { id: 1 },
      }
      let usuario = this.usuarioRepository.create(usuarioSanitizado);
      await this.usuarioRepository.save(usuario);
      return usuario;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error creating usuario',
        error.message,
      );
    }
  }

  /**
   * Find a usuario by ID
   * @param id - The ID of the usuario to find
   * @returns The found usuario
   */
  async findOne(id: number): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario with ID ${id} not found`);
      }
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Usuario with ID ${id} not found`);
    }
  }

  /**
   * Find a usuario by username
   * @param username - The username of the usuario to find
   * @returns The found usuario
   */
  async findOneWithUsername(username: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { usuario: username },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuario with username ${username} not found`,
        );
      }
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Usuario with username ${username} not found`,
      );
    }
  }

  /**
   * Find a usuario by email
   * @param email - The email of the usuario to find
   * @returns The found usuario
   */
  async findOneWithEmail(email: string): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { email },
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario with email ${email} not found`);
      }
      return usuario;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Usuario with email ${email} not found`);
    }
  }
}
