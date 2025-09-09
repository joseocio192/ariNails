import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Servicio } from './entities/servicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) { }

  async findAll() {
    try {
      return await this.servicioRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los servicios: ' + error.message);
    }
  }

  async findOne(id: number) {
    try {
      const servicio = await this.servicioRepository.findOne({ where: { id } });
      if (!servicio) {
        throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
      }
      return servicio;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el servicio: ' + error.message);
    }
  }

  async create(createServicioDto: CreateServicioDto) {
    try {
      const nuevoServicio = this.servicioRepository.create({
        ...createServicioDto,
        usuarioIdCreacion: 1, // Por defecto usuario admin - idealmente esto vendría del JWT
        usuarioIdActualizacion: 1,
      });
      return await this.servicioRepository.save(nuevoServicio);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el servicio: ' + error.message);
    }
  }

  async update(id: number, updateServicioDto: UpdateServicioDto) {
    try {
      await this.findOne(id); // Verificar que existe
      
      await this.servicioRepository.update(id, {
        ...updateServicioDto,
        usuarioIdActualizacion: 1, // Por defecto usuario admin - idealmente esto vendría del JWT
        fechaActualizacion: new Date(),
      });
      
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el servicio: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      const servicio = await this.findOne(id); // Verificar que existe
      await this.servicioRepository.remove(servicio);
      return { message: `Servicio con ID ${id} eliminado correctamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el servicio: ' + error.message);
    }
  }
}
