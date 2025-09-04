import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';
@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>
  ) { }
  async obtenerCitasDisponibles(month: string, year: string, empleadoid?: number) {
    try {
      const query = this.citasRepository.createQueryBuilder('cita')
        .select('cita.fecha, cita.horaInicio, cita.horaFinEsperada')
        .where('EXTRACT(MONTH FROM cita.fecha) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM cita.fecha) = :year', { year })
        .andWhere('cita.estaActivo = :estaActivo', { estaActivo: true });

      if (empleadoid) {
        query.andWhere('cita.empleadoId = :empleadoid', { empleadoid });
      }

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las citas disponibles: ' + error.message);
    }
  }
}
