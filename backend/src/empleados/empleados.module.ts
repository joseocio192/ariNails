import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { Empleado } from './entities/empleado.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Horario } from './entities/horario.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { Rol } from 'src/usuario/entities/rol.entityt';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
  imports: [TypeOrmModule.forFeature([Empleado, Horario, Usuario, Cita, Rol])],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
