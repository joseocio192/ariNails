import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Cita } from '../citas/entities/cita.entity';
import { Rol } from '../usuario/entities/rol.entityt';
import { Horario } from '../empleados/entities/horario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Cita)
    private citaRepository: Repository<Cita>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
  ) {}

  async onModuleInit() {
    console.log('🌱 Iniciando proceso de seeding...');
    await this.crearRolesBasicos();
    await this.crearUsuarioAdmin();
    await this.crearEmpleadosFicticios();
    await this.crearHorariosIniciales();
    await this.crearClientesDePrueba();
    await this.crearCitasDePrueba();
    console.log('✅ Proceso de seeding completado');
  }

  async crearRolesBasicos() {
    console.log('🔑 Verificando y creando roles básicos...');
    
    // Verificar si los roles ya existen
    const rolesExistentes = await this.rolRepository.count();
    if (rolesExistentes > 0) {
      console.log('Roles ya existen, saltando creación...');
      return;
    }

    const roles = [
      {
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        usuarioIdCreacion: 1,
        usuarioIdActualizacion: 1,
        estaActivo: true,
      },
      {
        nombre: 'empleado',
        descripcion: 'Empleado del salón',
        usuarioIdCreacion: 1,
        usuarioIdActualizacion: 1,
        estaActivo: true,
      },
      {
        nombre: 'cliente',
        descripcion: 'Cliente del salón',
        usuarioIdCreacion: 1,
        usuarioIdActualizacion: 1,
        estaActivo: true,
      }
    ];

    for (const rolData of roles) {
      try {
        // Para los primeros registros, usar 0 como valor temporal ya que aún no existe el usuario admin
        const rolParaCrear = {
          ...rolData,
          usuarioIdCreacion: 0,
          usuarioIdActualizacion: 0,
        };
        const nuevoRol = this.rolRepository.create(rolParaCrear);
        await this.rolRepository.save(nuevoRol);
        console.log(`✅ Rol '${rolData.nombre}' creado exitosamente`);
      } catch (error) {
        console.error(`❌ Error al crear rol '${rolData.nombre}':`, error.message);
      }
    }
  }

  async crearUsuarioAdmin() {
    console.log('👑 Verificando usuario administrador...');
    
    // Verificar si ya existe un usuario admin
    const adminExistente = await this.usuarioRepository.findOne({
      where: { email: 'admin@arinails.com' }
    });

    if (adminExistente) {
      console.log('Usuario admin ya existe, saltando creación...');
      return;
    }

    // Obtener el rol de admin
    const rolAdmin = await this.rolRepository.findOne({ where: { nombre: 'admin' } });
    if (!rolAdmin) {
      console.error('❌ Rol admin no encontrado');
      return;
    }

    try {
      // Crear usuario admin (la contraseña se hasheará automáticamente)
      const adminUsuario = this.usuarioRepository.create({
        nombres: 'Administrador',
        apellidoPaterno: 'Sistema',
        apellidoMaterno: 'AriNails',
        usuario: 'admin',
        email: 'admin@arinails.com',
        password: 'admin123456', // Se hasheará automáticamente
        rol_id: rolAdmin.id,
        usuarioIdCreacion: 0, // Usar 0 temporalmente
        usuarioIdActualizacion: 0,
        estaActivo: true,
      });

      await this.usuarioRepository.save(adminUsuario);
      console.log('✅ Usuario administrador creado exitosamente');
    } catch (error) {
      console.error('❌ Error al crear usuario admin:', error.message);
    }
  }

  async crearEmpleadosFicticios() {
    console.log('👥 Verificando y creando empleados ficticios...');
    
    // Contar empleados existentes
    const empleadosExistentes = await this.empleadoRepository.count();
    console.log(`Empleados existentes encontrados: ${empleadosExistentes}`);
    
    if (empleadosExistentes >= 3) {
      console.log('Ya existen suficientes empleados, saltando creación...');
      return;
    }

    // Obtener el rol de empleado
    const rolEmpleado = await this.rolRepository.findOne({ where: { nombre: 'empleado' } });
    if (!rolEmpleado) {
      console.error('❌ Rol empleado no encontrado');
      return;
    }

    const empleadosFicticios = [
      {
        usuario: {
          username: 'maria.rodriguez',
          nombres: 'María',
          apellidoPaterno: 'Rodríguez',
          apellidoMaterno: 'García',
          email: 'maria.rodriguez@arinails.com',
          password: 'empleado123',
          rolId: rolEmpleado.id,
        },
        telefono: '555-0101',
        direccion: 'Av. Principal 123, Ciudad',
      },
      {
        usuario: {
          username: 'ana.martinez',
          nombres: 'Ana',
          apellidoPaterno: 'Martínez',
          apellidoMaterno: 'López',
          email: 'ana.martinez@arinails.com',
          password: 'empleado123',
          rolId: rolEmpleado.id,
        },
        telefono: '555-0102',
        direccion: 'Calle Flores 456, Ciudad',
      },
      {
        usuario: {
          username: 'sofia.gonzalez',
          nombres: 'Sofía',
          apellidoPaterno: 'González',
          apellidoMaterno: 'Hernández',
          email: 'sofia.gonzalez@arinails.com',
          password: 'empleado123',
          rolId: rolEmpleado.id,
        },
        telefono: '555-0103',
        direccion: 'Plaza Central 789, Ciudad',
      },
      {
        usuario: {
          username: 'lucia.torres',
          nombres: 'Lucía',
          apellidoPaterno: 'Torres',
          apellidoMaterno: 'Morales',
          email: 'lucia.torres@arinails.com',
          password: 'empleado123',
          rolId: rolEmpleado.id,
        },
        telefono: '555-0104',
        direccion: 'Barrio Norte 321, Ciudad',
      },
    ];

    let empleadosCreados = 0;
    for (const empleadoData of empleadosFicticios) {
      try {
        console.log(`Intentando crear empleado: ${empleadoData.usuario.nombres} ${empleadoData.usuario.apellidoPaterno}`);
        
        // Verificar si el usuario ya existe
        const usuarioExistente = await this.usuarioRepository.findOne({
          where: { email: empleadoData.usuario.email },
          relations: ['empleados']
        });

        if (!usuarioExistente) {
          console.log(`Usuario no existe, creando: ${empleadoData.usuario.email}`);
          
          // Crear usuario (la contraseña se hasheará automáticamente)
          const nuevoUsuario = this.usuarioRepository.create({
            nombres: empleadoData.usuario.nombres,
            apellidoPaterno: empleadoData.usuario.apellidoPaterno,
            apellidoMaterno: empleadoData.usuario.apellidoMaterno,
            usuario: empleadoData.usuario.username,
            email: empleadoData.usuario.email,
            password: empleadoData.usuario.password, // Se hasheará automáticamente
            rol_id: empleadoData.usuario.rolId,
            usuarioIdCreacion: 1, // Usuario admin por defecto
            usuarioIdActualizacion: 1,
            estaActivo: true,
          });

          const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
          console.log(`✅ Usuario creado con ID: ${usuarioGuardado.id}`);

          // Crear empleado
          const nuevoEmpleado = this.empleadoRepository.create({
            telefono: empleadoData.telefono,
            direccion: empleadoData.direccion,
            usuario: usuarioGuardado,
            usuarioIdCreacion: 1, // Usuario admin por defecto
            usuarioIdActualizacion: 1,
            estaActivo: true,
          });

          await this.empleadoRepository.save(nuevoEmpleado);
          empleadosCreados++;

          console.log(`✅ Empleado ${empleadoData.usuario.nombres} ${empleadoData.usuario.apellidoPaterno} creado exitosamente`);
        } else {
          console.log(`Usuario ya existe: ${empleadoData.usuario.email}`);
          
          // Verificar si el empleado existe para este usuario
          const empleadoExistente = await this.empleadoRepository.findOne({
            where: { usuario: { id: usuarioExistente.id } }
          });

          if (!empleadoExistente) {
            console.log(`⚠️ Usuario existe pero NO tiene registro de empleado. Creando empleado...`);
            
            // Crear empleado para el usuario existente
            const nuevoEmpleado = this.empleadoRepository.create({
              telefono: empleadoData.telefono,
              direccion: empleadoData.direccion,
              usuario: usuarioExistente,
              usuarioIdCreacion: 1,
              usuarioIdActualizacion: 1,
              estaActivo: true,
            });

            await this.empleadoRepository.save(nuevoEmpleado);
            empleadosCreados++;

            console.log(`✅ Empleado ${empleadoData.usuario.nombres} ${empleadoData.usuario.apellidoPaterno} creado para usuario existente`);
          } else {
            console.log(`✅ Empleado ya existe para: ${empleadoData.usuario.email}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error al crear empleado ${empleadoData.usuario.nombres}:`, error.message);
      }
    }

    console.log(`✅ Proceso de creación de empleados completado. Empleados creados: ${empleadosCreados}`);
  }

  async crearHorariosIniciales() {
    console.log('⏰ Verificando y creando horarios iniciales...');
    
    // LIMPIAR HORARIOS EXISTENTES PARA EVITAR DUPLICADOS
    console.log('🧹 Limpiando horarios existentes...');
    await this.horarioRepository.clear(); // Usar clear() en lugar de delete({})
    console.log('✅ Horarios existentes eliminados');

    // Obtener todos los empleados activos
    const empleados = await this.empleadoRepository.find({
      where: { estaActivo: true },
      relations: ['usuario']
    });

    if (empleados.length === 0) {
      console.log('No hay empleados disponibles para crear horarios');
      return;
    }

    console.log(`Creando horarios personalizados para ${empleados.length} empleados...`);

    // Definir diferentes esquemas de horarios para empleados
    const esquemasHorarios = [
      {
        nombre: 'Turno Mañana',
        horas: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
        dias: [1, 2, 3, 4, 5] // Lunes a viernes
      },
      {
        nombre: 'Turno Tarde',
        horas: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
        dias: [1, 2, 3, 4, 5] // Lunes a viernes
      },
      {
        nombre: 'Turno Completo',
        horas: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'],
        dias: [1, 2, 3, 4, 5] // Lunes a viernes
      },
      {
        nombre: 'Turno Fin de Semana',
        horas: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        dias: [6, 0] // Sábado y domingo
      },
      {
        nombre: 'Turno Mixto',
        horas: ['08:00', '09:00', '10:00', '11:00', '16:00', '17:00', '18:00', '19:00'],
        dias: [1, 3, 5] // Lunes, miércoles, viernes
      }
    ];

    // Crear horarios para hoy y los próximos 14 días
    const fechasBase: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      fechasBase.push(fecha);
    }

    let horariosCreados = 0;
    
    // Asignar un esquema diferente a cada empleado
    for (let i = 0; i < empleados.length; i++) {
      const empleado = empleados[i];
      const esquema = esquemasHorarios[i % esquemasHorarios.length];
      
      console.log(`Creando horarios "${esquema.nombre}" para ${empleado.usuario?.nombres} ${empleado.usuario?.apellidoPaterno}...`);
      
      for (const fechaBase of fechasBase) {
        const diaSemana = fechaBase.getDay();
        
        // Verificar si el empleado trabaja este día según su esquema
        if (esquema.dias.includes(diaSemana)) {
          const fechaStr = fechaBase.toISOString().split('T')[0];
          
          try {
            for (const hora of esquema.horas) {
              const horaInicio = new Date(`${fechaStr}T${hora}:00`);
              const horaFin = new Date(horaInicio);
              horaFin.setHours(horaFin.getHours() + 1); // Agregar 1 hora

              const horario = this.horarioRepository.create({
                desde: horaInicio,
                hasta: horaFin,
                empleado,
                usuarioIdCreacion: 1,
                usuarioIdActualizacion: 1,
                estaActivo: true,
              });

              await this.horarioRepository.save(horario);
              horariosCreados++;
            }
            
            console.log(`✅ Horarios ${esquema.nombre} creados para ${empleado.usuario?.nombres || 'Empleado'} el ${fechaStr}`);
          } catch (error) {
            console.error(`❌ Error al crear horarios para empleado ${empleado.id}:`, error.message);
          }
        }
      }
    }

    console.log(`✅ Proceso de creación de horarios completado. Horarios creados: ${horariosCreados}`);
    console.log('📅 Resumen de horarios asignados:');
    for (let i = 0; i < empleados.length; i++) {
      const empleado = empleados[i];
      const esquema = esquemasHorarios[i % esquemasHorarios.length];
      console.log(`   ${empleado.usuario?.nombres} ${empleado.usuario?.apellidoPaterno}: ${esquema.nombre}`);
    }
  }

  async crearClientesDePrueba() {
    console.log('👤 Verificando y creando clientes de prueba...');
    
    // Verificar si ya existen clientes
    const clientesExistentes = await this.clienteRepository.count();
    if (clientesExistentes > 0) {
      console.log('Ya existen clientes, saltando creación...');
      return;
    }

    // Obtener el rol de cliente
    const rolCliente = await this.rolRepository.findOne({ where: { nombre: 'cliente' } });
    if (!rolCliente) {
      console.error('❌ Rol cliente no encontrado');
      return;
    }

    const clientesPrueba = [
      {
        nombres: 'María',
        apellidoPaterno: 'García',
        apellidoMaterno: 'Hernández',
        usuario: 'maria.garcia',
        email: 'maria.garcia@cliente.com',
        password: 'cliente123',
        telefono: '555-1001',
        direccion: 'Calle Luna 123, Ciudad',
      },
      {
        nombres: 'Carmen',
        apellidoPaterno: 'López',
        apellidoMaterno: 'Silva',
        usuario: 'carmen.lopez',
        email: 'carmen.lopez@cliente.com', 
        password: 'cliente123',
        telefono: '555-1002',
        direccion: 'Av. Sol 456, Ciudad',
      },
    ];

    for (const clienteData of clientesPrueba) {
      try {
        // Crear usuario cliente
        const nuevoUsuario = this.usuarioRepository.create({
          nombres: clienteData.nombres,
          apellidoPaterno: clienteData.apellidoPaterno,
          apellidoMaterno: clienteData.apellidoMaterno,
          usuario: clienteData.usuario,
          email: clienteData.email,
          password: clienteData.password,
          rol_id: rolCliente.id,
          usuarioIdCreacion: 1,
          usuarioIdActualizacion: 1,
          estaActivo: true,
        });

        const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

        // Crear cliente
        const nuevoCliente = this.clienteRepository.create({
          telefono: clienteData.telefono,
          direccion: clienteData.direccion,
          usuario: usuarioGuardado,
          usuarioIdCreacion: 1,
          usuarioIdActualizacion: 1,
          estaActivo: true,
        });

        await this.clienteRepository.save(nuevoCliente);
        console.log(`✅ Cliente ${clienteData.nombres} ${clienteData.apellidoPaterno} creado exitosamente`);
      } catch (error) {
        console.error(`❌ Error al crear cliente ${clienteData.nombres}:`, error.message);
      }
    }
  }

  async crearCitasDePrueba() {
    console.log('📅 Verificando y creando citas de prueba...');
    
    // Verificar si ya existen citas
    const citasExistentes = await this.citaRepository.count();
    if (citasExistentes > 0) {
      console.log('Ya existen citas, saltando creación...');
      return;
    }

    // Obtener Ana Martínez (empleado)
    const anaMartinez = await this.empleadoRepository.findOne({
      where: { usuario: { email: 'ana.martinez@arinails.com' } },
      relations: ['usuario']
    });

    if (!anaMartinez) {
      console.log('❌ No se encontró el empleado Ana Martínez');
      return;
    }

    // Obtener clientes de prueba
    const clientes = await this.clienteRepository.find({
      relations: ['usuario'],
      take: 2
    });

    if (clientes.length === 0) {
      console.log('❌ No hay clientes disponibles para crear citas');
      return;
    }

    const fechaHoy = new Date();
    const fechaManana = new Date(fechaHoy);
    fechaManana.setDate(fechaManana.getDate() + 1);

    const citasPrueba = [
      {
        cliente: clientes[0],
        empleado: anaMartinez,
        fecha: fechaHoy,
        hora: '10:00',
        precio: 50.00,
        precioFull: 50.00,
        descuento: 0,
        precioFinal: 50.00,
      },
      {
        cliente: clientes[1] || clientes[0],
        empleado: anaMartinez,
        fecha: fechaManana,
        hora: '14:30',
        precio: 75.00,
        precioFull: 75.00,
        descuento: 0,
        precioFinal: 75.00,
      },
    ];

    for (const citaData of citasPrueba) {
      try {
        const nuevaCita = this.citaRepository.create({
          fecha: citaData.fecha,
          hora: citaData.hora,
          horaInicio: citaData.hora,
          cliente: citaData.cliente,
          empleado: citaData.empleado,
          precio: citaData.precio,
          precioFull: citaData.precioFull,
          descuento: citaData.descuento,
          precioFinal: citaData.precioFinal,
          cancelada: false,
          usuarioIdCreacion: citaData.cliente.usuario?.id || 1,
          usuarioIdActualizacion: citaData.cliente.usuario?.id || 1,
          estaActivo: true,
        });

        await this.citaRepository.save(nuevaCita);
        console.log(`✅ Cita creada para ${citaData.cliente.usuario?.nombres} con Ana Martínez el ${citaData.fecha.toDateString()} a las ${citaData.hora}`);
      } catch (error) {
        console.error(`❌ Error al crear cita:`, error.message);
      }
    }
  }
}
