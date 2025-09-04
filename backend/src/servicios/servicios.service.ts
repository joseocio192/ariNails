import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Servicio } from './entities/servicio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
