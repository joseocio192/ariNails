import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Cliente } from './entities/cliente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  imports: [TypeOrmModule.forFeature([Cliente])],
  exports: [],
})
export class ClientesModule {}
