import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Horario } from '../empleados/entities/horario.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Cita } from '../citas/entities/cita.entity';
import { 
  HorarioDisponibleDto, 
  ConfiguracionHorarioDto, 
  CrearHorarioDto, 
  HorarioEmpleadoVistaDto 
} from './dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private horariosRepository: Repository<Horario>,
    @InjectRepository(Empleado)
    private empleadosRepository: Repository<Empleado>,
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
  ) {}

  async obtenerHorariosDisponibles(fecha: string): Promise<HorarioDisponibleDto[]> {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay();
    
    // Obtener todos los empleados activos
    const empleados = await this.empleadosRepository.find({
      where: { estaActivo: true },
      relations: ['usuario', 'horarios'],
    });

    const horariosDisponibles: HorarioDisponibleDto[] = [];
    
    // Usar un Set para evitar duplicados del mismo empleado en la misma hora
    const combinacionesUnicas = new Set<string>();
    
    for (const empleado of empleados) {
      // Filtrar horarios para el día de la semana específico
      const horariosDelDia = empleado.horarios.filter(horario => {
        const fechaHorario = new Date(horario.desde);
        return fechaHorario.getDay() === diaSemana;
      });

      for (const horario of horariosDelDia) {
        const horaInicio = new Date(horario.desde);
        const horaFin = new Date(horario.hasta);
        
        // Generar slots de 1 hora
        const slots = this.generarSlots(horaInicio, horaFin);
        
        for (const slot of slots) {
          // Crear clave única para empleado + hora
          const claveUnica = `${empleado.id}-${slot}`;
          
          // Si ya existe esta combinación, saltarla
          if (combinacionesUnicas.has(claveUnica)) {
            continue;
          }
          
          // Verificar si ya existe una cita en ese horario
          const citaExistente = await this.citasRepository.findOne({
            where: {
              fecha: fechaObj,
              hora: slot,
              empleado: { id: empleado.id },
              cancelada: false,
              estaActivo: true,
            },
          });

          if (!citaExistente) {
            combinacionesUnicas.add(claveUnica);
            horariosDisponibles.push({
              hora: slot,
              empleado: {
                id: empleado.id,
                nombre: empleado.usuario?.nombres || 'Sin nombre',
                apellidos: `${empleado.usuario?.apellidoPaterno || ''} ${empleado.usuario?.apellidoMaterno || ''}`.trim(),
              },
            });
          }
        }
      }
    }

    return horariosDisponibles.sort((a, b) => a.hora.localeCompare(b.hora));
  }

  async verificarDiaActivo(fecha: string): Promise<boolean> {
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay();
    
    // Verificar si hay empleados con horarios para este día
    const empleadosConHorarios = await this.empleadosRepository
      .createQueryBuilder('empleado')
      .innerJoin('empleado.horarios', 'horario')
      .where('empleado.estaActivo = :activo', { activo: true })
      .andWhere('EXTRACT(DOW FROM horario.desde) = :diaSemana', { diaSemana })
      .getCount();

    return empleadosConHorarios > 0;
  }

  async configurarHorarioEmpleado(configuraciones: ConfiguracionHorarioDto[]): Promise<void> {
    for (const config of configuraciones) {
      const empleado = await this.empleadosRepository.findOne({
        where: { id: config.empleadoId },
      });

      if (!empleado) {
        throw new NotFoundException(`Empleado con ID ${config.empleadoId} no encontrado`);
      }

      // Crear fecha para el día de la semana especificado
      const fecha = this.obtenerFechaParaDiaSemana(config.diaSemana);
      const horaInicio = new Date(`${fecha}T${config.horaInicio}:00`);
      const horaFin = new Date(`${fecha}T${config.horaFin}:00`);

      if (horaInicio >= horaFin) {
        throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
      }

      // Eliminar horarios existentes para este día
      await this.horariosRepository.delete({
        empleado: { id: config.empleadoId },
        desde: Between(
          new Date(`${fecha}T00:00:00`),
          new Date(`${fecha}T23:59:59`)
        ),
      });

      // Crear nuevo horario
      const nuevoHorario = this.horariosRepository.create({
        desde: horaInicio,
        hasta: horaFin,
        empleado,
        usuarioIdCreacion: 1, // Por defecto usuario admin
        usuarioIdActualizacion: 1,
        estaActivo: true,
      });

      await this.horariosRepository.save(nuevoHorario);
    }
  }

  async obtenerHorariosEmpleado(empleadoId: number): Promise<Horario[]> {
    return this.horariosRepository.find({
      where: { empleado: { id: empleadoId }, estaActivo: true },
      relations: ['empleado', 'empleado.usuario'],
      order: { desde: 'ASC' },
    });
  }

  async obtenerHorariosEmpleadoDetallado(empleadoId: number, fecha?: string): Promise<HorarioEmpleadoVistaDto[]> {
    const query = this.horariosRepository.createQueryBuilder('horario')
      .leftJoinAndSelect('horario.empleado', 'empleado')
      .where('horario.empleado.id = :empleadoId', { empleadoId })
      .andWhere('horario.estaActivo = :estaActivo', { estaActivo: true });

    if (fecha) {
      const fechaObj = new Date(fecha + 'T00:00:00');
      const fechaInicio = new Date(fechaObj);
      const fechaFin = new Date(fechaObj);
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      query.andWhere('horario.desde >= :fechaInicio', { fechaInicio })
           .andWhere('horario.desde < :fechaFin', { fechaFin });
    }

    const horarios = await query.orderBy('horario.desde', 'ASC').getMany();
    const resultado: HorarioEmpleadoVistaDto[] = [];

    // Usar un Set para evitar duplicados
    const horariosUnicos = new Set<string>();

    for (const horario of horarios) {
      const horaInicio = new Date(horario.desde);
      const hora = horaInicio.toTimeString().slice(0, 5); // HH:mm
      const fechaStr = horaInicio.toDateString();
      
      // Crear clave única para empleado + fecha + hora
      const claveUnica = `${empleadoId}-${fechaStr}-${hora}`;
      
      // Si ya existe esta combinación, saltarla
      if (horariosUnicos.has(claveUnica)) {
        continue;
      }
      
      horariosUnicos.add(claveUnica);

      // Verificar si hay una cita en este horario específico
      const cita = await this.citasRepository.findOne({
        where: {
          fecha: new Date(fechaStr),
          hora: hora,
          empleado: { id: empleadoId },
          cancelada: false,
          estaActivo: true,
        },
        relations: ['cliente', 'cliente.usuario'],
      });

      const horarioVista: HorarioEmpleadoVistaDto = {
        id: horario.id,
        fecha: horaInicio,
        horaInicio: hora,
        horaFin: this.sumarHora(hora),
        disponible: !cita,
      };

      if (cita) {
        horarioVista.cita = {
          id: cita.id,
          cliente: `${cita.cliente.usuario?.nombres || ''} ${cita.cliente.usuario?.apellidoPaterno || ''}`.trim(),
          telefono: cita.cliente.telefono || 'Sin teléfono',
        };
      }

      resultado.push(horarioVista);
    }

    return resultado;
  }

  async crearHorarioEmpleado(crearHorarioDto: CrearHorarioDto): Promise<Horario> {
    const { empleadoId, fecha, horaInicio, horaFin } = crearHorarioDto;

    // Verificar que el empleado existe
    const empleado = await this.empleadosRepository.findOne({ where: { id: empleadoId } });
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }

    // Crear las fechas
    const fechaInicio = new Date(`${fecha}T${horaInicio}:00`);
    const fechaFin = new Date(`${fecha}T${horaFin}:00`);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }

    // Verificar que no hay conflicto con horarios existentes
    // Buscar horarios que se solapen con el nuevo horario
    const horariosConflictivos = await this.horariosRepository
      .createQueryBuilder('horario')
      .where('horario.empleado.id = :empleadoId', { empleadoId })
      .andWhere('horario.estaActivo = :estaActivo', { estaActivo: true })
      .andWhere(
        '(horario.desde < :fechaFin AND horario.hasta > :fechaInicio)',
        { fechaInicio, fechaFin }
      )
      .getMany();

    if (horariosConflictivos.length > 0) {
      throw new BadRequestException(
        'Schedule conflict: The requested time slot overlaps with existing schedules.'
      );
    }

    // Crear el horario
    const nuevoHorario = this.horariosRepository.create({
      desde: fechaInicio,
      hasta: fechaFin,
      empleado,
      usuarioIdCreacion: 1, // En un caso real, sería el ID del usuario autenticado
      usuarioIdActualizacion: 1,
      estaActivo: true,
    });

    return await this.horariosRepository.save(nuevoHorario);
  }

  async eliminarHorarioEmpleado(horarioId: number, empleadoId: number): Promise<void> {
    const horario = await this.horariosRepository.findOne({
      where: { id: horarioId, empleado: { id: empleadoId } },
    });

    if (!horario) {
      throw new NotFoundException('Horario no encontrado');
    }

    const horaInicio = new Date(horario.desde);
    const hora = horaInicio.toTimeString().slice(0, 5); // HH:mm

    // Verificar que no hay citas asignadas en esta hora específica
    const citaEnHorario = await this.citasRepository.findOne({
      where: {
        empleado: { id: empleadoId },
        fecha: new Date(horaInicio.toDateString()),
        hora: hora,
        cancelada: false,
        estaActivo: true,
      },
    });

    if (citaEnHorario) {
      throw new BadRequestException('No se puede eliminar un horario que tiene una cita asignada');
    }

    horario.estaActivo = false;
    await this.horariosRepository.save(horario);
  }

  private sumarHora(hora: string): string {
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas + 1, minutos, 0, 0);
    
    return fecha.toTimeString().slice(0, 5);
  }

  private generarSlots(horaInicio: Date, horaFin: Date): string[] {
    const slots: string[] = [];
    const current = new Date(horaInicio);
    
    while (current < horaFin) {
      const hora = current.getHours().toString().padStart(2, '0');
      const minutos = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${hora}:${minutos}`);
      
      // Incrementar 1 hora
      current.setHours(current.getHours() + 1);
    }
    
    return slots;
  }

  private obtenerFechaParaDiaSemana(diaSemana: number): string {
    // Obtener una fecha de referencia para el día de la semana especificado
    const hoy = new Date();
    const diff = diaSemana - hoy.getDay();
    const fecha = new Date(hoy.getTime() + diff * 24 * 60 * 60 * 1000);
    return fecha.toISOString().split('T')[0];
  }

  async crearHorariosIniciales(): Promise<void> {
    // Crear horarios de prueba para empleados existentes
    const empleados = await this.empleadosRepository.find({
      where: { estaActivo: true },
      take: 3, // Solo los primeros 3 empleados
    });

    for (const empleado of empleados) {
      // Crear horarios de lunes a viernes (1-5) de 8:00 a 12:00 y de 14:00 a 18:00
      for (let dia = 1; dia <= 5; dia++) {
        const fecha = this.obtenerFechaParaDiaSemana(dia);
        
        // Horario de mañana: 8:00 - 12:00
        const horarioManana = this.horariosRepository.create({
          desde: new Date(`${fecha}T08:00:00`),
          hasta: new Date(`${fecha}T12:00:00`),
          empleado,
          usuarioIdCreacion: 1,
          usuarioIdActualizacion: 1,
          estaActivo: true,
        });

        // Horario de tarde: 14:00 - 18:00
        const horarioTarde = this.horariosRepository.create({
          desde: new Date(`${fecha}T14:00:00`),
          hasta: new Date(`${fecha}T18:00:00`),
          empleado,
          usuarioIdCreacion: 1,
          usuarioIdActualizacion: 1,
          estaActivo: true,
        });

        await this.horariosRepository.save([horarioManana, horarioTarde]);
      }
    }
  }

  // Métodos específicos para administradores - gestión de calendario
  async bloquearHorario(horarioId: number): Promise<Horario> {
    try {
      const horario = await this.horariosRepository.findOne({ where: { id: horarioId } });
      if (!horario) {
        throw new NotFoundException('Horario no encontrado');
      }

      horario.estaActivo = false;
      horario.usuarioIdActualizacion = 1; // Idealmente vendría del JWT
      horario.fechaActualizacion = new Date();

      return await this.horariosRepository.save(horario);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al bloquear horario: ' + error.message);
    }
  }

  async habilitarHorario(horarioId: number): Promise<Horario> {
    try {
      const horario = await this.horariosRepository.findOne({ where: { id: horarioId } });
      if (!horario) {
        throw new NotFoundException('Horario no encontrado');
      }

      horario.estaActivo = true;
      horario.usuarioIdActualizacion = 1; // Idealmente vendría del JWT
      horario.fechaActualizacion = new Date();

      return await this.horariosRepository.save(horario);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al habilitar horario: ' + error.message);
    }
  }

  async bloquearDiaCompleto(fecha: string, empleadoId?: number): Promise<void> {
    try {
      let query = this.horariosRepository.createQueryBuilder()
        .update(Horario)
        .set({ 
          estaActivo: false,
          usuarioIdActualizacion: 1,
          fechaActualizacion: new Date()
        })
        .where('DATE(desde) = :fecha', { fecha });

      if (empleadoId) {
        query = query.andWhere('empleadoId = :empleadoId', { empleadoId });
      }

      await query.execute();
    } catch (error) {
      throw new BadRequestException('Error al bloquear día completo: ' + error.message);
    }
  }

  async habilitarDiaCompleto(fecha: string, empleadoId?: number): Promise<void> {
    try {
      let query = this.horariosRepository.createQueryBuilder()
        .update(Horario)
        .set({ 
          estaActivo: true,
          usuarioIdActualizacion: 1,
          fechaActualizacion: new Date()
        })
        .where('DATE(desde) = :fecha', { fecha });

      if (empleadoId) {
        query = query.andWhere('empleadoId = :empleadoId', { empleadoId });
      }

      await query.execute();
    } catch (error) {
      throw new BadRequestException('Error al habilitar día completo: ' + error.message);
    }
  }

  async obtenerEstadoCalendario(fechaInicio: string, fechaFin: string): Promise<any[]> {
    try {
      const horarios = await this.horariosRepository
        .createQueryBuilder('horario')
        .leftJoinAndSelect('horario.empleado', 'empleado')
        .leftJoinAndSelect('empleado.usuario', 'empleadoUsuario')
        .leftJoin('empleado.citas', 'cita', 'DATE(cita.fecha) = DATE(horario.desde) AND cita.cancelada = false')
        .where('DATE(horario.desde) BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
        .orderBy('horario.desde', 'ASC')
        .getMany();

      return horarios.map(horario => ({
        id: horario.id,
        fecha: horario.desde.toISOString().split('T')[0],
        horaInicio: horario.desde.toTimeString().split(' ')[0].substring(0, 5),
        horaFin: horario.hasta.toTimeString().split(' ')[0].substring(0, 5),
        empleado: {
          id: horario.empleado.id,
          nombres: horario.empleado.usuario.nombres,
          apellidos: `${horario.empleado.usuario.apellidoPaterno} ${horario.empleado.usuario.apellidoMaterno}`,
        },
        activo: horario.estaActivo,
        ocupado: false, // Se podría calcular si hay citas en ese horario
      }));
    } catch (error) {
      throw new BadRequestException('Error al obtener estado del calendario: ' + error.message);
    }
  }
}
