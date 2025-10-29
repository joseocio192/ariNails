import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entityt';
import { Cliente } from '../clientes/entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  /**
   * Ensure default roles exist in the database
   */
  private async ensureDefaultRoles(): Promise<void> {
    const roles = [
      { nombre: 'cliente', descripcion: 'Usuario cliente' },
      { nombre: 'empleado', descripcion: 'Usuario empleado' },
      { nombre: 'admin', descripcion: 'Usuario administrador' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.rolRepository.findOne({
        where: { nombre: roleData.nombre },
      });

      if (!existingRole) {
        const newRole = this.rolRepository.create({
          ...roleData,
          usuarioIdCreacion: 1,
          usuarioIdActualizacion: 1,
          estaActivo: true,
        });
        await this.rolRepository.save(newRole);
      }
    }
  }

  /**
   * Register a new usuario
   * @param createUsuarioDto - The data transfer object containing usuario details
   * @returns The newly created usuario
   */
  async registerUsuarioCliente(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<Usuario> {
    try {
      // Ensure default roles exist
      await this.ensureDefaultRoles();

      const existingUsuario = await this.usuarioRepository.findOne({
        where: [
          { email: createUsuarioDto.email },
          { usuario: createUsuarioDto.usuario },
        ],
      });
      if (existingUsuario) {
        throw new ConflictException('Usuario already exists');
      }

      // Find the cliente role
      const clienteRole = await this.rolRepository.findOne({
        where: { nombre: 'cliente' },
      });

      if (!clienteRole) {
        throw new InternalServerErrorException(
          'Default cliente role not found',
        );
      }

      const usuarioSanitizado = {
        ...createUsuarioDto,
        usuarioIdCreacion: 1,
        usuarioIdActualizacion: 1,
        estaActivo: true,
        rol_id: clienteRole.id,
      };
      const usuario = this.usuarioRepository.create(usuarioSanitizado);
      await this.usuarioRepository.save(usuario);

      // Crear automáticamente el registro de Cliente
      const cliente = this.clienteRepository.create({
        telefono: '', // Campo por defecto, se puede actualizar después
        direccion: '', // Campo por defecto, se puede actualizar después
        usuario: usuario,
        usuarioIdCreacion: 1,
        usuarioIdActualizacion: 1,
        estaActivo: true,
      });
      await this.clienteRepository.save(cliente);

      const usuarioRegistrado = await this.usuarioRepository.findOneOrFail({
        where: { id: usuario.id },
        relations: ['clientes'],
      });
      return usuarioRegistrado;
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
        relations: ['rol', 'clientes', 'empleados'], // Incluir todas las relaciones necesarias
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
        relations: ['rol', 'clientes', 'empleados'], // Incluir todas las relaciones necesarias
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

  async updateUsuarioCliente(
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    try {
      const usuario = await this.usuarioRepository.findOneByOrFail({
        id: updateUsuarioDto.id,
      });

      const updatedUsuario = Object.assign(usuario, updateUsuarioDto);
      await this.usuarioRepository.save(updatedUsuario);
      return this.usuarioRepository.findOneByOrFail({ id: updatedUsuario.id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Usuario with ID ${updateUsuarioDto.id} not found`,
      );
    }
  }
}
