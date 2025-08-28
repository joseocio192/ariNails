import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { Servicio } from './entities/servicio.entity';
import { ServiciosToRoles } from './entities/serviciosToRoles.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Servicio, ServiciosToRoles])],
  controllers: [ServiciosController],
  providers: [ServiciosService],
})
export class ServiciosModule {}
