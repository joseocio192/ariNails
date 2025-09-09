import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorariosController } from './horarios.controller';
import { HorariosService } from './horarios.service';
import { Horario } from '../empleados/entities/horario.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Cita } from '../citas/entities/cita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Empleado, Cita])],
  controllers: [HorariosController],
  providers: [HorariosService],
  exports: [HorariosService],
})
export class HorariosModule {}
