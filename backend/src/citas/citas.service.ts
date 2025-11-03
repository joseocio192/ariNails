import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Horario } from '../empleados/entities/horario.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { CitasToServicios } from './entities/citasToServicios.entity';
import {
  CreateCitaDto,
  CitaEmpleadoVistaDto,
  CitaClienteVistaDto,
} from './dto';
import Stripe from 'stripe';

@Injectable()
export class CitasService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Cita)
    private readonly citasRepository: Repository<Cita>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Horario)
    private readonly horariosRepository: Repository<Horario>,
    @InjectRepository(Servicio)
    private readonly serviciosRepository: Repository<Servicio>,
    @InjectRepository(CitasToServicios)
    private readonly citasToServiciosRepository: Repository<CitasToServicios>,
  ) {
    // Inicializar Stripe con la clave secreta
    this.stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async obtenerCitasDisponibles(
    month: string,
    year: string,
    empleadoid?: number,
  ) {
    try {
      const query = this.citasRepository
        .createQueryBuilder('cita')
        .select('cita.fecha, cita.horaInicio, cita.horaFinEsperada')
        .where('EXTRACT(MONTH FROM cita.fecha) = :month', { month })
        .andWhere('EXTRACT(YEAR FROM cita.fecha) = :year', { year })
        .andWhere('cita.estaActivo = :estaActivo', { estaActivo: true });

      if (empleadoid) {
        query.andWhere('cita.empleadoId = :empleadoid', { empleadoid });
      }

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las citas disponibles: ' + error.message,
      );
    }
  }

  async crearCita(crearCitaDto: CreateCitaDto): Promise<Cita> {
    try {
      const {
        clienteId,
        empleadoId,
        horarioId,
        fecha,
        hora,
        serviciosIds,
        anticipoPagado,
        stripePaymentIntentId,
      } = crearCitaDto;

      // Verificar que el cliente existe
      const cliente = await this.clienteRepository.findOne({
        where: { id: clienteId },
        relations: ['usuario'],
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      let empleado: Empleado;

      // Si se proporciona horarioId, obtener el empleado de ahí
      if (horarioId) {
        // El horarioId viene en formato "horarioRealId-hora", extraer el ID numérico
        const horarioRealId = parseInt(horarioId.split('-')[0], 10);
        
        if (isNaN(horarioRealId)) {
          throw new BadRequestException('Formato de horarioId inválido');
        }
        
        const horario = await this.horariosRepository.findOne({
          where: { id: horarioRealId },
          relations: ['empleado'],
        });
        if (!horario) {
          throw new NotFoundException('Horario no encontrado');
        }
        empleado = horario.empleado;
      } else if (empleadoId) {
        // Sino, usar el empleadoId directamente
        const empleadoFound = await this.empleadoRepository.findOne({
          where: { id: empleadoId },
        });
        if (!empleadoFound) {
          throw new NotFoundException('Empleado no encontrado');
        }
        empleado = empleadoFound;
      } else {
        throw new BadRequestException(
          'Debe proporcionar empleadoId o horarioId',
        );
      }

      // Verificar que el horario está disponible
      const fechaObj = new Date(fecha + 'T00:00:00');
      const citaExistente = await this.citasRepository.findOne({
        where: {
          fecha: fechaObj,
          hora: hora,
          empleado: { id: empleado.id },
          cancelada: false,
          estaActivo: true,
        },
      });

      if (citaExistente) {
        throw new BadRequestException('El horario ya está ocupado');
      }

      // Obtener los servicios y calcular precios
      const servicios = await this.serviciosRepository.findByIds(serviciosIds);
      if (servicios.length !== serviciosIds.length) {
        throw new NotFoundException('Uno o más servicios no encontrados');
      }

      const precioTotal = servicios.reduce(
        (sum, servicio) => sum + Number(servicio.precio),
        0,
      );

      // Crear la cita
      const nuevaCita = this.citasRepository.create({
        fecha: fechaObj,
        hora: hora,
        horaInicio: hora,
        cliente: cliente,
        empleado: empleado,
        precio: precioTotal,
        precioFull: precioTotal,
        descuento: 0,
        precioFinal: precioTotal,
        anticipoPagado: anticipoPagado || 0,
        stripePaymentIntentId: stripePaymentIntentId || undefined,
        cancelada: false,
        estaActivo: true,
        usuarioIdCreacion: cliente.usuario?.id || 1,
        usuarioIdActualizacion: cliente.usuario?.id || 1,
      });

      const citaGuardada = await this.citasRepository.save(nuevaCita);

      // Crear las relaciones con los servicios
      for (const servicio of servicios) {
        const citaToServicio = this.citasToServiciosRepository.create({
          cita: citaGuardada,
          servicio: servicio,
          usuarioIdCreacion: cliente.usuario?.id || 1,
          usuarioIdActualizacion: cliente.usuario?.id || 1,
        });
        await this.citasToServiciosRepository.save(citaToServicio);
      }

      return citaGuardada;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear la cita: ' + error.message,
      );
    }
  }

  async obtenerCitasEmpleado(
    empleadoId: number,
    fecha?: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<CitaEmpleadoVistaDto[]> {
    try {
      const query = this.citasRepository
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cliente.usuario', 'usuarioCliente')
        .leftJoinAndSelect('cita.citasToServicios', 'citasToServicios')
        .leftJoinAndSelect('citasToServicios.servicio', 'servicio')
        .where('cita.empleado.id = :empleadoId', { empleadoId })
        .andWhere('cita.estaActivo = :estaActivo', { estaActivo: true })
        .orderBy('cita.fecha', 'ASC')
        .addOrderBy('cita.hora', 'ASC');

      if (fecha) {
        query.andWhere('DATE(cita.fecha) = :fecha', { fecha });
      } else if (fechaInicio && fechaFin) {
        query.andWhere('DATE(cita.fecha) BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio,
          fechaFin,
        });
      }

      const citas = await query.getMany();

      return citas.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        cliente: {
          id: cita.cliente.id,
          nombres: cita.cliente.usuario?.nombres || 'Sin nombre',
          apellidos:
            `${cita.cliente.usuario?.apellidoPaterno || ''} ${cita.cliente.usuario?.apellidoMaterno || ''}`.trim(),
          telefono: cita.cliente.telefono || 'Sin teléfono',
        },
        servicios:
          cita.citasToServicios
            ?.map((cts) => cts.servicio?.nombre)
            .filter(Boolean) || [],
        precio: cita.precioFinal || 0,
        cancelada: cita.cancelada,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las citas del empleado: ' + error.message,
      );
    }
  }

  async obtenerCitasCliente(clienteId: number): Promise<CitaClienteVistaDto[]> {
    try {
      const citas = await this.citasRepository.find({
        where: {
          cliente: { id: clienteId },
          estaActivo: true,
        },
        relations: [
          'empleado',
          'empleado.usuario',
          'citasToServicios',
          'citasToServicios.servicio',
        ],
        order: {
          fecha: 'ASC',
          hora: 'ASC',
        },
      });

      return citas.map((cita) => ({
        id: cita.id,
        fecha: cita.fecha,
        hora: cita.hora,
        empleado: {
          id: cita.empleado?.id || 0,
          nombres: cita.empleado?.usuario?.nombres || 'Sin asignar',
          apellidos:
            `${cita.empleado?.usuario?.apellidoPaterno || ''} ${cita.empleado?.usuario?.apellidoMaterno || ''}`.trim(),
        },
        servicios:
          cita.citasToServicios
            ?.map((cts) => ({
              id: cts.servicio?.id || 0,
              nombre: cts.servicio?.nombre || '',
              precio: Number(cts.servicio?.precio || 0),
            }))
            .filter((s) => s.nombre) || [],
        precio: cita.precioFinal || 0,
        anticipoPagado: cita.anticipoPagado || 0,
        saldoPendiente: (cita.precioFinal || 0) - (cita.anticipoPagado || 0),
        cancelada: cita.cancelada,
        motivoCancelacion: cita.motivoCancelacion || undefined,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las citas del cliente: ' + error.message,
      );
    }
  }

  async cancelarCita(citaId: number, motivo: string): Promise<Cita> {
    try {
      const cita = await this.citasRepository.findOne({
        where: { id: citaId },
      });
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
      throw new InternalServerErrorException(
        'Error al cancelar la cita: ' + error.message,
      );
    }
  }

  async cancelarOReagendarCita(
    citaId: number,
    motivo: string,
    realizarReembolso: boolean,
    nuevaFecha?: string,
    nuevaHora?: string,
  ): Promise<Cita> {
    try {
      const cita = await this.citasRepository.findOne({
        where: { id: citaId },
        relations: ['cliente', 'empleado', 'citasToServicios', 'citasToServicios.servicio'],
      });

      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }

      // Lógica de cancelación/reagendado
      if (realizarReembolso) {
        // CASO 1: Cancelación con reembolso (staff cancela)
        // Realizar reembolso con Stripe
        if (cita.stripePaymentIntentId) {
          try {
            console.log(`💳 Procesando reembolso de Stripe para PaymentIntent: ${cita.stripePaymentIntentId}`);
            
            const refund = await this.stripe.refunds.create({
              payment_intent: cita.stripePaymentIntentId,
              reason: 'requested_by_customer', // Stripe requiere una razón
            });

            console.log(`✅ Reembolso procesado exitosamente. Refund ID: ${refund.id}`);
            console.log(`   - Monto: $${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()}`);
            console.log(`   - Estado: ${refund.status}`);
            
            // Guardar el ID del reembolso en el motivo para referencia
            cita.motivoCancelacion = `${motivo} | Refund ID: ${refund.id}`;
          } catch (stripeError) {
            console.error('❌ Error al procesar reembolso de Stripe:', stripeError);
            throw new InternalServerErrorException(
              `Error al procesar el reembolso: ${stripeError.message}`
            );
          }
        } else {
          console.warn('⚠️ La cita no tiene stripePaymentIntentId, no se puede procesar reembolso');
          cita.motivoCancelacion = motivo;
        }

        // Marcar la cita como cancelada
        cita.cancelada = true;
        console.log(`✅ Cita ${citaId} cancelada con reembolso. Motivo: ${motivo}`);
      } else if (nuevaFecha && nuevaHora) {
        // CASO 2: Reagendar sin reembolso (staff reagenda)
        // Convertir string a Date (formato YYYY-MM-DD)
        const [year, month, day] = nuevaFecha.split('-').map(Number);
        const fechaDate = new Date(year, month - 1, day); // month es 0-indexed

        // Actualizar la cita con la nueva fecha y hora
        cita.fecha = fechaDate;
        cita.hora = nuevaHora;
        cita.motivoCancelacion = `Reagendada: ${motivo}`;
        // NO marcar como cancelada si se reagenda
        cita.cancelada = false;

        console.log(`✅ Cita ${citaId} reagendada para ${nuevaFecha} a las ${nuevaHora}`);
      } else {
        // CASO 3: Cancelación sin reembolso y sin reagendar (cliente cancela)
        cita.cancelada = true;
        cita.motivoCancelacion = motivo;
        console.log(`✅ Cita ${citaId} cancelada sin reembolso. Motivo: ${motivo}`);
      }

      return await this.citasRepository.save(cita);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al procesar la cancelación/reagendado: ' + error.message,
      );
    }
  }

  // Métodos específicos para administradores
  async obtenerTodasLasCitas(
    fecha?: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<any[]> {
    try {
      let query = this.citasRepository
        .createQueryBuilder('cita')
        .leftJoinAndSelect('cita.cliente', 'cliente')
        .leftJoinAndSelect('cliente.usuario', 'clienteUsuario')
        .leftJoinAndSelect('cita.empleado', 'empleado')
        .leftJoinAndSelect('empleado.usuario', 'empleadoUsuario')
        .leftJoinAndSelect('cita.citasToServicios', 'citasToServicios')
        .leftJoinAndSelect('citasToServicios.servicio', 'servicio')
        .orderBy('cita.fecha', 'ASC')
        .addOrderBy('cita.hora', 'ASC');

      if (fecha) {
        // Usar DATE() para comparar solo la parte de fecha sin tiempo
        query = query.where('DATE(cita.fecha) = :fecha', { fecha });
      } else if (fechaInicio && fechaFin) {
        query = query.where('DATE(cita.fecha) BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio,
          fechaFin,
        });
      }

      const citas = await query.getMany();

      return citas.map((cita) => ({
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
        empleado: cita.empleado
          ? {
              id: cita.empleado.id,
              nombres: cita.empleado.usuario.nombres,
              apellidos: `${cita.empleado.usuario.apellidoPaterno} ${cita.empleado.usuario.apellidoMaterno}`,
            }
          : null,
        servicios: cita.citasToServicios.map((cts) => ({
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
      throw new InternalServerErrorException(
        'Error al obtener todas las citas: ' + error.message,
      );
    }
  }

  async obtenerEstadisticasCitas() {
    try {
      const totalCitas = await this.citasRepository.count();
      const citasCanceladas = await this.citasRepository.count({
        where: { cancelada: true },
      });
      const citasCompletadas = await this.citasRepository.count({
        where: { cancelada: false },
      });

      // Citas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = await this.citasRepository.count({
        where: { fecha: new Date(hoy) },
      });

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
      throw new InternalServerErrorException(
        'Error al obtener estadísticas de citas: ' + error.message,
      );
    }
  }

  async actualizarEstadoCita(
    citaId: number,
    estado: 'completada' | 'cancelada',
    motivo?: string,
  ): Promise<Cita> {
    try {
      const cita = await this.citasRepository.findOne({
        where: { id: citaId },
      });
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
      throw new InternalServerErrorException(
        'Error al actualizar estado de la cita: ' + error.message,
      );
    }
  }
}
