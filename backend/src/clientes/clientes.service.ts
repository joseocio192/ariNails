import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cita } from '../citas/entities/cita.entity';
import {
  ClienteListItemDto,
  ClienteListResponseDto,
  GetClientesQueryDto,
} from './dto/cliente-list.dto';
import { UpdateClienteDto, ToggleClienteStatusDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
  ) {}

  /**
   * Obtiene lista paginada de clientes con búsqueda
   */
  async findAll(query: GetClientesQueryDto): Promise<ClienteListResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || '';
    const sortBy = query.sortBy || 'fechaCreacion';
    const sortOrder = query.sortOrder || 'DESC';

    // Query builder para búsqueda compleja
    const queryBuilder = this.clienteRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.usuario', 'usuario')
      .leftJoinAndSelect('cliente.citas', 'citas');

    // Filtrar solo clientes (rol_id = 3)
    queryBuilder.andWhere('usuario.rol_id = :rolId', { rolId: 3 });

    // Aplicar búsqueda por nombre, email o teléfono
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(usuario.nombres) LIKE LOWER(:search) OR ' +
          'LOWER(usuario.apellidoPaterno) LIKE LOWER(:search) OR ' +
          'LOWER(usuario.apellidoMaterno) LIKE LOWER(:search) OR ' +
          'LOWER(usuario.email) LIKE LOWER(:search) OR ' +
          'LOWER(cliente.telefono) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Filtrar por estado activo
    if (query.estaActivo !== undefined) {
      queryBuilder.andWhere('usuario.estaActivo = :estaActivo', {
        estaActivo: query.estaActivo,
      });
    }

    // Ordenamiento
    const sortField = sortBy === 'nombreCompleto' ? 'usuario.nombres' : `cliente.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);

    // Obtener total y datos
    const [clientes, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Mapear a DTOs con información adicional
    const data: ClienteListItemDto[] = await Promise.all(
      clientes.map(async (cliente) => {
        // Contar citas completadas y canceladas
        const citasCompletadas = await this.citaRepository.count({
          where: {
            cliente: { id: cliente.id },
            cancelada: false,
            estaActivo: true,
          },
        });

        const citasCanceladas = await this.citaRepository.count({
          where: {
            cliente: { id: cliente.id },
            cancelada: true,
          },
        });

        // Obtener última sesión (última cita completada)
        const ultimaCita = await this.citaRepository.findOne({
          where: {
            cliente: { id: cliente.id },
            cancelada: false,
          },
          order: {
            fecha: 'DESC',
          },
        });

        return {
          id: cliente.id,
          usuarioId: cliente.usuario.id,
          nombreCompleto: `${cliente.usuario.nombres} ${cliente.usuario.apellidoPaterno} ${cliente.usuario.apellidoMaterno || ''}`.trim(),
          email: cliente.usuario.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          ultimaSesion: ultimaCita?.fecha,
          citasCompletadas,
          citasCanceladas,
          totalCitas: citasCompletadas + citasCanceladas,
          estaActivo: cliente.usuario.estaActivo,
          fechaCreacion: cliente.fechaCreacion,
        };
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Actualiza datos del cliente
   */
  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Actualizar datos del usuario si se proporcionaron
    if (
      updateClienteDto.nombres ||
      updateClienteDto.apellidoPaterno ||
      updateClienteDto.apellidoMaterno ||
      updateClienteDto.email
    ) {
      const usuario = cliente.usuario;

      if (updateClienteDto.nombres) usuario.nombres = updateClienteDto.nombres;
      if (updateClienteDto.apellidoPaterno)
        usuario.apellidoPaterno = updateClienteDto.apellidoPaterno;
      if (updateClienteDto.apellidoMaterno)
        usuario.apellidoMaterno = updateClienteDto.apellidoMaterno;

      // Verificar email único si se cambió
      if (updateClienteDto.email && updateClienteDto.email !== usuario.email) {
        const existingUser = await this.usuarioRepository.findOne({
          where: { email: updateClienteDto.email },
        });
        if (existingUser && existingUser.id !== usuario.id) {
          throw new BadRequestException('El email ya está en uso');
        }
        usuario.email = updateClienteDto.email;
      }

      await this.usuarioRepository.save(usuario);
    }

    // Actualizar datos del cliente
    if (updateClienteDto.telefono) cliente.telefono = updateClienteDto.telefono;
    if (updateClienteDto.direccion) cliente.direccion = updateClienteDto.direccion;

    await this.clienteRepository.save(cliente);

    const updatedCliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    return updatedCliente!;
  }

  /**
   * Habilita o deshabilita la cuenta del cliente
   */
  async toggleStatus(
    id: number,
    toggleStatusDto: ToggleClienteStatusDto,
  ): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Actualizar estado del usuario
    cliente.usuario.estaActivo = toggleStatusDto.estaActivo;
    await this.usuarioRepository.save(cliente.usuario);

    const updatedCliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    return updatedCliente!;
  }

  /**
   * Obtiene un cliente por ID
   */
  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['usuario', 'citas'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }
}
