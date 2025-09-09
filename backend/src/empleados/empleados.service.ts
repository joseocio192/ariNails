import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Empleado } from './entities/empleado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadosRepository: Repository<Empleado>,
  ) {}

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
}
