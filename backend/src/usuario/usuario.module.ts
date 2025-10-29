import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/rol.entityt';
@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol, Cliente])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService, UsuarioModule],
})
export class UsuarioModule {}
