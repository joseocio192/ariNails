import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { CreateCitaDto, CitaEmpleadoVistaDto, CitaClienteVistaDto } from './dto';

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

  async crearCita(crearCitaDto: CreateCitaDto): Promise<Cita> {
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

  async obtenerCitasEmpleado(empleadoId: number, fecha?: string): Promise<CitaEmpleadoVistaDto[]> {
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

  async obtenerCitasCliente(clienteId: number): Promise<CitaClienteVistaDto[]> {
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

  // Métodos específicos para administradores
  async obtenerTodasLasCitas(fecha?: string): Promise<any[]> {
    try {
      let query = this.citasRepository.createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cliente.usuario', 'clienteUsuario')
        .leftJoinAndSelect('cita.empleado', 'empleado')
        .leftJoinAndSelect('empleado.usuario', 'empleadoUsuario')
        .leftJoinAndSelect('cita.citasToServicios', 'citasToServicios')
        .leftJoinAndSelect('citasToServicios.servicio', 'servicio')
        .orderBy('cita.fecha', 'ASC')
        .addOrderBy('cita.hora', 'ASC');

      if (fecha) {
        query = query.where('cita.fecha = :fecha', { fecha });
      }

      const citas = await query.getMany();

      return citas.map(cita => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        horaInicio: cita.horaInicio,
        horaFinEsperada: cita.horaFinEsperada,
        horaFin: cita.horaFin,
        cliente: {
          id: cita.cliente.id,
          nombres: cita.cliente.usuario.nombres,
          apellidos: `${cita.cliente.usuario.apellidoPaterno} ${cita.cliente.usuario.apellidoMaterno}`,
          telefono: cita.cliente.telefono,
          email: cita.cliente.usuario.email,
        },
        empleado: cita.empleado ? {
          id: cita.empleado.id,
          nombres: cita.empleado.usuario.nombres,
          apellidos: `${cita.empleado.usuario.apellidoPaterno} ${cita.empleado.usuario.apellidoMaterno}`,
        } : null,
        servicios: cita.citasToServicios.map(cts => ({
          id: cts.servicio.id,
          nombre: cts.servicio.nombre,
          precio: cts.servicio.precio,
        })),
        precio: cita.precio,
        precioFull: cita.precioFull,
        descuento: cita.descuento,
        precioFinal: cita.precioFinal,
        cancelada: cita.cancelada,
        motivoCancelacion: cita.motivoCancelacion,
      }));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener todas las citas: ' + error.message);
    }
  }

  async obtenerEstadisticasCitas() {
    try {
      const totalCitas = await this.citasRepository.count();
      const citasCanceladas = await this.citasRepository.count({ where: { cancelada: true } });
      const citasCompletadas = await this.citasRepository.count({ where: { cancelada: false } });
      
      // Citas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = await this.citasRepository.count({ where: { fecha: new Date(hoy) } });
      
      // Ingresos totales (solo citas no canceladas)
      const resultadoIngresos = await this.citasRepository
        .createQueryBuilder('cita')
        .select('SUM(cita.precioFinal)', 'total')
        .where('cita.cancelada = false')
        .getRawOne();

      return {
        totalCitas,
        citasCanceladas,
        citasCompletadas,
        citasHoy,
        ingresosTotales: parseFloat(resultadoIngresos.total) || 0,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener estadísticas de citas: ' + error.message);
    }
  }

  async actualizarEstadoCita(citaId: number, estado: 'completada' | 'cancelada', motivo?: string): Promise<Cita> {
    try {
      const cita = await this.citasRepository.findOne({ where: { id: citaId } });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }

      if (estado === 'cancelada') {
        cita.cancelada = true;
        cita.motivoCancelacion = motivo || 'Cancelada por administrador';
      } else if (estado === 'completada') {
        cita.cancelada = false;
        cita.horaFin = new Date().toTimeString().split(' ')[0];
      }

      return await this.citasRepository.save(cita);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar estado de la cita: ' + error.message);
    }
  }
}
