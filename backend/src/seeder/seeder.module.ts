import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Cita } from '../citas/entities/cita.entity';
import { Rol } from '../usuario/entities/rol.entityt';
import { Horario } from '../empleados/entities/horario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Empleado, Cliente, Cita, Rol, Horario]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
