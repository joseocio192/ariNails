import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './entities/cita.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasToServicios } from './entities/citasToServicios.entity';
@Module({
  controllers: [CitasController],
  providers: [CitasService],
  imports: [TypeOrmModule.forFeature([Cita, CitasToServicios])],
})
export class CitasModule {}
