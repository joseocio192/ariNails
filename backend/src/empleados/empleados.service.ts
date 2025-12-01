import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Empleado } from './entities/empleado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import {
  EmpleadoListItemDto,
  EmpleadoListResponseDto,
  GetEmpleadosQueryDto,
} from './dto/empleado-list.dto';
import {
  UpdateEmpleadoDto,
  ToggleEmpleadoStatusDto,
} from './dto/update-empleado.dto';
import {
  AvailableUserDto,
  AvailableUsersResponseDto,
  GetAvailableUsersQueryDto,
} from './dto/available-users.dto';
import { PromoteToEmpleadoDto } from './dto/promote-empleado.dto';
import { Rol } from 'src/usuario/entities/rol.entityt';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadosRepository: Repository<Empleado>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Cita)
    private readonly citaRepository: Repository<Cita>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  /**
   * Obtiene lista paginada de empleados con filtros
   */
  async findAll(
    query: GetEmpleadosQueryDto,
  ): Promise<EmpleadoListResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'fechaCreacion',
      sortOrder = 'DESC',
      estaActivo,
    } = query;

    const queryBuilder = this.empleadosRepository
      .createQueryBuilder('empleado')
      .leftJoinAndSelect('empleado.usuario', 'usuario')
      .leftJoin('usuario.rol', 'rol')
      .where('rol.nombre = :empleadoRole', { empleadoRole: 'empleado' });

    // Filtro de búsqueda
    if (search) {
      queryBuilder.andWhere(
        '(usuario.nombres LIKE :search OR usuario.apellidoPaterno LIKE :search OR usuario.apellidoMaterno LIKE :search OR usuario.email LIKE :search OR empleado.telefono LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro por estado
    if (estaActivo !== undefined) {
      queryBuilder.andWhere('usuario.estaActivo = :estaActivo', { estaActivo });
    }

    // Ordenamiento
    const sortMapping = {
      nombreCompleto: 'usuario.nombres',
      email: 'usuario.email',
      telefono: 'empleado.telefono',
      fechaCreacion: 'empleado.fechaCreacion',
    };

    const sortColumn = sortMapping[sortBy] || 'empleado.fechaCreacion';
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [empleados, total] = await queryBuilder.getManyAndCount();

    // Obtener todas las estadísticas de citas en una sola query
    const empleadoIds = empleados.map((e) => e.id);
    
    if (empleadoIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const citaStats = await this.citaRepository
      .createQueryBuilder('cita')
      .select('cita.empleadoId', 'empleadoId')
      .addSelect('COUNT(*)', 'totalCitas')
      .addSelect(
        'SUM(CASE WHEN cita.cancelada = false THEN 1 ELSE 0 END)',
        'citasCompletadas',
      )
      .addSelect(
        'SUM(CASE WHEN cita.cancelada = true THEN 1 ELSE 0 END)',
        'citasCanceladas',
      )
      .addSelect('MAX(CASE WHEN cita.cancelada = false THEN cita.fechaCreacion END)', 'ultimaSesion')
      .where('cita.empleadoId IN (:...empleadoIds)', { empleadoIds })
      .groupBy('cita.empleadoId')
      .getRawMany();

    const statsMap = new Map(
      citaStats.map((stat) => [
        stat.empleadoId,
        {
          totalCitas: parseInt(stat.totalCitas) || 0,
          citasCompletadas: parseInt(stat.citasCompletadas) || 0,
          citasCanceladas: parseInt(stat.citasCanceladas) || 0,
          ultimaSesion: stat.ultimaSesion || null,
        },
      ]),
    );

    // Mapear resultados
    const data: EmpleadoListItemDto[] = empleados.map((empleado) => {
      const stats = statsMap.get(empleado.id) || {
        totalCitas: 0,
        citasCompletadas: 0,
        citasCanceladas: 0,
        ultimaSesion: null,
      };

      return {
        id: empleado.id,
        usuarioId: empleado.usuario.id,
        nombreCompleto: `${empleado.usuario.nombres} ${empleado.usuario.apellidoPaterno} ${empleado.usuario.apellidoMaterno || ''}`.trim(),
        email: empleado.usuario.email,
        telefono: empleado.telefono,
        direccion: empleado.direccion,
        ultimaSesion: stats.ultimaSesion,
        citasCompletadas: stats.citasCompletadas,
        citasCanceladas: stats.citasCanceladas,
        totalCitas: stats.totalCitas,
        estaActivo: empleado.usuario.estaActivo,
        fechaCreacion: empleado.fechaCreacion,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene un empleado por ID
   */
  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadosRepository.findOne({
      where: { id },
      relations: ['usuario', 'citas'],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  /**
   * Actualiza datos del empleado
   */
  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    const empleado = await this.empleadosRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Actualizar datos del usuario
    if (updateEmpleadoDto.nombres)
      empleado.usuario.nombres = updateEmpleadoDto.nombres;
    if (updateEmpleadoDto.apellidoPaterno)
      empleado.usuario.apellidoPaterno = updateEmpleadoDto.apellidoPaterno;
    if (updateEmpleadoDto.apellidoMaterno)
      empleado.usuario.apellidoMaterno = updateEmpleadoDto.apellidoMaterno;

    if (updateEmpleadoDto.email) {
      // Verificar que el email no esté en uso
      const existingUser = await this.usuarioRepository.findOne({
        where: { email: updateEmpleadoDto.email },
      });

      if (existingUser && existingUser.id !== empleado.usuario.id) {
        throw new ConflictException('El email ya está en uso');
      }

      empleado.usuario.email = updateEmpleadoDto.email;
    }

    await this.usuarioRepository.save(empleado.usuario);

    // Actualizar datos del empleado
    if (updateEmpleadoDto.telefono)
      empleado.telefono = updateEmpleadoDto.telefono;
    if (updateEmpleadoDto.direccion)
      empleado.direccion = updateEmpleadoDto.direccion;

    await this.empleadosRepository.save(empleado);

    const updatedEmpleado = await this.empleadosRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    return updatedEmpleado!;
  }

  /**
   * Habilita o deshabilita la cuenta del empleado
   */
  async toggleStatus(
    id: number,
    toggleStatusDto: ToggleEmpleadoStatusDto,
  ): Promise<Empleado> {
    const empleado = await this.empleadosRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    // Actualizar estado del usuario
    empleado.usuario.estaActivo = toggleStatusDto.estaActivo;
    await this.usuarioRepository.save(empleado.usuario);

    const updatedEmpleado = await this.empleadosRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    return updatedEmpleado!;
  }

  async find(
    employeeId: number | undefined,
    employeeName: string | undefined,
  ): Promise<Empleado | Empleado[]> {
    try {
      if (employeeId) {
        const empleado = await this.empleadosRepository.findOne({
          where: { id: employeeId },
          relations: ['usuario'],
        });
        if (!empleado) {
          throw new NotFoundException('Empleado no encontrado');
        }
        return empleado;
      }

      if (employeeName) {
        const empleados = await this.empleadosRepository
          .createQueryBuilder('empleado')
          .leftJoinAndSelect('empleado.usuario', 'usuario')
          .where(
            'usuario.nombres LIKE :name OR usuario.apellidoPaterno LIKE :name OR usuario.apellidoMaterno LIKE :name',
            { name: `%${employeeName}%` },
          )
          .getMany();
        if (empleados.length === 0) {
          throw new NotFoundException(
            'No se encontraron empleados con ese nombre',
          );
        }
        return empleados;
      }
      const empleados = await this.empleadosRepository.find({
        relations: ['usuario'],
        where: { estaActivo: true },
      });
      return empleados;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Empleado no encontrado');
      }
      console.error('Error fetching empleados:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener los empleados',
      );
    }
  }

  /**
   * Obtiene lista de usuarios disponibles para convertir en empleados
   * Excluye usuarios que ya son empleados o administradores
   */
  async findAvailableUsers(
    query: GetAvailableUsersQueryDto,
  ): Promise<AvailableUsersResponseDto> {
    const { search } = query;

    const queryBuilder = this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoin('usuario.rol', 'rol')
      .where('rol.nombre = :clienteRole', { clienteRole: 'cliente' })
      .andWhere('usuario.estaActivo = :activo', { activo: true });

    if (search) {
      queryBuilder.andWhere(
        '(usuario.nombres LIKE :search OR usuario.apellidoPaterno LIKE :search OR usuario.apellidoMaterno LIKE :search OR usuario.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('usuario.nombres', 'ASC');

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    const data: AvailableUserDto[] = usuarios.map((usuario) => ({
      id: usuario.id,
      nombres: usuario.nombres,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      email: usuario.email,
      telefono: undefined, // Usuario no tiene campo telefono
      nombreCompleto: `${usuario.nombres} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`.trim(),
    }));

    return { data, total };
  }

  /**
   * Promueve un usuario a empleado (solo actualiza el rol)
   */
  async promoteToEmpleado(
    usuarioId: number,
    promoteDto: PromoteToEmpleadoDto,
    currentUserId: number,
  ): Promise<Usuario> {
    // Verificar que el usuario existe y no es admin
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      relations: ['rol', 'empleados'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar rol
    if (usuario.rol.nombre.toLowerCase() === 'admin') {
      throw new ConflictException(
        'No se puede convertir un administrador en empleado',
      );
    }

    if (usuario.rol.nombre.toLowerCase() === 'empleado') {
      throw new ConflictException('El usuario ya es un empleado');
    }

    // Buscar el rol de empleado usando el repositorio
    const rolEmpleado = await this.rolRepository.findOne({
      where: { nombre: 'empleado' },
    });

    if (!rolEmpleado) {
      throw new InternalServerErrorException('Rol de empleado no encontrado en el sistema');
    }

    // Actualizar rol del usuario a empleado usando update directo
    await this.usuarioRepository.update(
      { id: usuarioId },
      { rol_id: rolEmpleado.id }
    );

    // Crear el registro de Empleado si no existe
    const existingEmpleado = await this.empleadosRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });

    if (!existingEmpleado) {
      const nuevoEmpleado = this.empleadosRepository.create({
        telefono: promoteDto.telefono || '',
        direccion: promoteDto.direccion || '',
        usuario: usuario,
        usuarioIdCreacion: currentUserId,
        usuarioIdActualizacion: currentUserId,
        estaActivo: true,
      });
      await this.empleadosRepository.save(nuevoEmpleado);
    }

    // Obtener el usuario actualizado con todas las relaciones
    const updatedUsuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      relations: ['rol', 'empleados'],
    });

    return updatedUsuario!;
  }

  /**
   * Degrada un empleado a cliente (solo actualiza el rol)
   */
  async demoteToCliente(empleadoId: number, currentUserId: number): Promise<void> {
    // Buscar el empleado para obtener su usuario
    const empleado = await this.empleadosRepository.findOne({
      where: { id: empleadoId },
      relations: ['usuario', 'usuario.rol'],
    });

    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    const usuario = empleado.usuario;

    // Verificar que es empleado
    if (usuario.rol.nombre.toLowerCase() !== 'empleado') {
      throw new ConflictException('El usuario no es un empleado');
    }

    // Buscar el rol de cliente usando el repositorio
    const rolCliente = await this.rolRepository.findOne({
      where: { nombre: 'cliente' },
    });

    if (!rolCliente) {
      throw new InternalServerErrorException('Rol de cliente no encontrado en el sistema');
    }

    // Cambiar rol del usuario a cliente usando update directo
    await this.usuarioRepository.update(
      { id: usuario.id },
      { rol_id: rolCliente.id }
    );
  }

  /**
   * Repara usuarios con rol empleado pero sin registro en tabla Empleado
   * Útil para corregir datos de usuarios promovidos antes de la corrección
   */
  async repairEmpleadoRecords(currentUserId: number): Promise<{
    fixed: number;
    details: string[];
  }> {
    const details: string[] = [];
    let fixed = 0;

    // Buscar el rol de empleado
    const rolEmpleado = await this.rolRepository.findOne({
      where: { nombre: 'empleado' },
    });

    if (!rolEmpleado) {
      throw new InternalServerErrorException('Rol de empleado no encontrado');
    }

    // Buscar todos los usuarios con rol empleado
    const usuariosEmpleados = await this.usuarioRepository.find({
      where: { rol_id: rolEmpleado.id },
      relations: ['empleados'],
    });

    // Para cada usuario empleado, verificar si tiene registro en tabla Empleado
    for (const usuario of usuariosEmpleados) {
      if (!usuario.empleados || usuario.empleados.length === 0) {
        // Crear registro de Empleado
        const nuevoEmpleado = this.empleadosRepository.create({
          telefono: '',
          direccion: '',
          usuario: usuario,
          usuarioIdCreacion: currentUserId,
          usuarioIdActualizacion: currentUserId,
          estaActivo: true,
        });
        await this.empleadosRepository.save(nuevoEmpleado);
        
        fixed++;
        details.push(`Usuario ${usuario.id} (${usuario.nombres} ${usuario.apellidoPaterno}) - Registro de empleado creado`);
      }
    }

    return { fixed, details };
  }
}

