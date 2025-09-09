import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './entities/cita.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasToServicios } from './entities/citasToServicios.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';

@Module({
  controllers: [CitasController],
  providers: [CitasService],
  imports: [TypeOrmModule.forFeature([Cita, CitasToServicios, Cliente, Empleado])],
})
export class CitasModule {}
