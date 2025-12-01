import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisenoUna } from './entities/diseno.entity';
import { CreateDisenoDto } from './dto/create-diseno.dto';
import { UpdateDisenoDto } from './dto/update-diseno.dto';
import {
  GetDisenosQueryDto,
  DisenoListItemDto,
  DisenosResponseDto,
} from './dto/diseno-list.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DisenosService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'disenos');

  constructor(
    @InjectRepository(DisenoUna)
    private readonly disenoRepository: Repository<DisenoUna>,
  ) {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Obtiene lista paginada de diseños con filtros
   */
  async findAll(query: GetDisenosQueryDto): Promise<DisenosResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'fechaCreacion',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.disenoRepository
      .createQueryBuilder('diseno')
      .leftJoinAndSelect('diseno.empleadoCreador', 'empleado')
      .where('diseno.estaActivo = :activo', { activo: true });

    // Filtro de búsqueda
    if (search) {
      queryBuilder.andWhere(
        '(diseno.titulo LIKE :search OR diseno.descripcion LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Ordenamiento
    const sortMapping = {
      titulo: 'diseno.titulo',
      fechaCreacion: 'diseno.fechaCreacion',
    };

    const sortColumn = sortMapping[sortBy] || 'diseno.fechaCreacion';
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [disenos, total] = await queryBuilder.getManyAndCount();

    // Mapear resultados
    const data: DisenoListItemDto[] = disenos.map((diseno) => ({
      id: diseno.id,
      titulo: diseno.titulo,
      imagenUrl: diseno.imagenUrl,
      descripcion: diseno.descripcion,
      empleadoIdCreador: diseno.empleadoIdCreador,
      nombreEmpleado: `${diseno.empleadoCreador.nombres} ${diseno.empleadoCreador.apellidoPaterno}`,
      fechaCreacion: diseno.fechaCreacion,
      estaActivo: diseno.estaActivo,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene todos los diseños activos (para clientes)
   */
  async findAllActive(): Promise<DisenoListItemDto[]> {
    const disenos = await this.disenoRepository.find({
      where: { estaActivo: true },
      relations: ['empleadoCreador'],
      order: { fechaCreacion: 'DESC' },
    });

    return disenos.map((diseno) => ({
      id: diseno.id,
      titulo: diseno.titulo,
      imagenUrl: diseno.imagenUrl,
      descripcion: diseno.descripcion,
      empleadoIdCreador: diseno.empleadoIdCreador,
      nombreEmpleado: `${diseno.empleadoCreador.nombres} ${diseno.empleadoCreador.apellidoPaterno}`,
      fechaCreacion: diseno.fechaCreacion,
      estaActivo: diseno.estaActivo,
    }));
  }

  /**
   * Obtiene un diseño por ID
   */
  async findOne(id: number): Promise<DisenoUna> {
    const diseno = await this.disenoRepository.findOne({
      where: { id },
      relations: ['empleadoCreador'],
    });

    if (!diseno) {
      throw new NotFoundException(`Diseño con ID ${id} no encontrado`);
    }

    return diseno;
  }

  /**
   * Crea un nuevo diseño
   */
  async create(
    createDisenoDto: CreateDisenoDto,
    file: any,
    empleadoId: number,
  ): Promise<DisenoUna> {
    if (!file) {
      throw new BadRequestException('La imagen es requerida');
    }

    // Generar URL de la imagen
    const imagenUrl = `/uploads/disenos/${file.filename}`;

    const diseno = this.disenoRepository.create({
      ...createDisenoDto,
      imagenUrl,
      empleadoIdCreador: empleadoId,
      usuarioIdCreacion: empleadoId,
      usuarioIdActualizacion: empleadoId,
    });

    return await this.disenoRepository.save(diseno);
  }

  /**
   * Actualiza un diseño existente
   */
  async update(
    id: number,
    updateDisenoDto: UpdateDisenoDto,
    file: any,
    empleadoId: number,
  ): Promise<DisenoUna> {
    const diseno = await this.findOne(id);

    // Actualizar campos
    if (updateDisenoDto.titulo) {
      diseno.titulo = updateDisenoDto.titulo;
    }

    if (updateDisenoDto.descripcion !== undefined) {
      diseno.descripcion = updateDisenoDto.descripcion;
    }

    // Si se sube nueva imagen, eliminar la anterior y actualizar
    if (file) {
      // Eliminar imagen anterior
      const oldImagePath = path.join(process.cwd(), 'public', diseno.imagenUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      diseno.imagenUrl = `/uploads/disenos/${file.filename}`;
    }

    diseno.usuarioIdActualizacion = empleadoId;

    return await this.disenoRepository.save(diseno);
  }

  /**
   * Elimina (soft delete) un diseño
   */
  async remove(id: number): Promise<void> {
    const diseno = await this.findOne(id);

    diseno.estaActivo = false;
    await this.disenoRepository.save(diseno);
  }

  /**
   * Elimina físicamente un diseño y su imagen
   */
  async hardDelete(id: number): Promise<void> {
    const diseno = await this.findOne(id);

    // Eliminar imagen del sistema de archivos
    const imagePath = path.join(process.cwd(), 'public', diseno.imagenUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await this.disenoRepository.remove(diseno);
  }
}
