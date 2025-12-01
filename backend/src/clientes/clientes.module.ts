import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cita } from '../citas/entities/cita.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [TypeOrmModule.forFeature([Cliente, Usuario, Cita])],
  exports: [ClientesService],
})
export class ClientesModule {}
