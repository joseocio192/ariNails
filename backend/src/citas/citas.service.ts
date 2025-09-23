import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';

export interface CrearCitaDto {
  clienteId: number;
  empleadoId: number;
  fecha: string;
  hora: string;
  serviciosIds: number[];
}

export interface CitaEmpleadoVista {
  id: number;
  fecha: Date;
  hora: string;
  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    telefono: string;
  };
  servicios: string[];
  precio: number;
  cancelada: boolean;
}

export interface CitaClienteVista {
  id: number;
  fecha: Date;
  hora: string;
  empleado: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  servicios: string[];
  precio: number;
  cancelada: boolean;
}

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
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

  async crearCita(crearCitaDto: CrearCitaDto): Promise<Cita> {
    try {
      const { clienteId, empleadoId, fecha, hora, serviciosIds } = crearCitaDto;

      // Verificar que el cliente existe
      const cliente = await this.clienteRepository.findOne({ 
        where: { id: clienteId },
        relations: ['usuario']
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Verificar que el empleado existe
      const empleado = await this.empleadoRepository.findOne({ where: { id: empleadoId } });
      if (!empleado) {
        throw new NotFoundException('Empleado no encontrado');
      }

      // Verificar que el horario está disponible
      const fechaObj = new Date(fecha + 'T00:00:00');
      const citaExistente = await this.citasRepository.findOne({
        where: {
          fecha: fechaObj,
          hora: hora,
          empleado: { id: empleadoId },
          cancelada: false,
          estaActivo: true,
        },
      });

      if (citaExistente) {
        throw new BadRequestException('El horario ya está ocupado');
      }

      // Crear la cita
      const nuevaCita = this.citasRepository.create({
        fecha: fechaObj,
        hora: hora,
        horaInicio: hora,
        cliente: cliente,
        empleado: empleado,
        precio: 0,
        precioFull: 0,
        descuento: 0,
        precioFinal: 0,
        cancelada: false,
        estaActivo: true,
        usuarioIdCreacion: cliente.usuario?.id || 1,
        usuarioIdActualizacion: cliente.usuario?.id || 1,
      });

      return await this.citasRepository.save(nuevaCita);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la cita: ' + error.message);
    }
  }

  async obtenerCitasEmpleado(empleadoId: number, fecha?: string): Promise<CitaEmpleadoVista[]> {
    try {
      const query = this.citasRepository.createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cliente.usuario', 'usuarioCliente')
        .leftJoinAndSelect('cita.citasToServicios', 'citasToServicios')
        .leftJoinAndSelect('citasToServicios.servicio', 'servicio')
        .where('cita.empleado.id = :empleadoId', { empleadoId })
        .andWhere('cita.estaActivo = :estaActivo', { estaActivo: true })
        .orderBy('cita.fecha', 'ASC')
        .addOrderBy('cita.hora', 'ASC');

      if (fecha) {
        const fechaObj = new Date(fecha + 'T00:00:00');
        query.andWhere('cita.fecha = :fecha', { fecha: fechaObj });
      }

      const citas = await query.getMany();

      return citas.map(cita => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        cliente: {
          id: cita.cliente.id,
          nombres: cita.cliente.usuario?.nombres || 'Sin nombre',
          apellidos: `${cita.cliente.usuario?.apellidoPaterno || ''} ${cita.cliente.usuario?.apellidoMaterno || ''}`.trim(),
          telefono: cita.cliente.telefono || 'Sin teléfono',
        },
        servicios: cita.citasToServicios?.map(cts => cts.servicio?.nombre).filter(Boolean) || [],
        precio: cita.precioFinal || 0,
        cancelada: cita.cancelada,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las citas del empleado: ' + error.message);
    }
  }

  async obtenerCitasCliente(clienteId: number): Promise<CitaClienteVista[]> {
    try {
      const citas = await this.citasRepository.find({
        where: {
          cliente: { id: clienteId },
          estaActivo: true,
        },
        relations: ['empleado', 'empleado.usuario', 'citasToServicios', 'citasToServicios.servicio'],
        order: {
          fecha: 'ASC',
          hora: 'ASC',
        },
      });

      return citas.map(cita => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        empleado: {
          id: cita.empleado?.id || 0,
          nombres: cita.empleado?.usuario?.nombres || 'Sin asignar',
          apellidos: `${cita.empleado?.usuario?.apellidoPaterno || ''} ${cita.empleado?.usuario?.apellidoMaterno || ''}`.trim(),
        },
        servicios: cita.citasToServicios?.map(cts => cts.servicio?.nombre).filter(Boolean) || [],
        precio: cita.precioFinal || 0,
        cancelada: cita.cancelada,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las citas del cliente: ' + error.message);
    }
  }

  async cancelarCita(citaId: number, motivo: string): Promise<Cita> {
    try {
      const cita = await this.citasRepository.findOne({ where: { id: citaId } });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }

      cita.cancelada = true;
      cita.motivoCancelacion = motivo;

      return await this.citasRepository.save(cita);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al cancelar la cita: ' + error.message);
    }
  }
}
