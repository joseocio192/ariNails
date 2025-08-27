import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return await this.usuarioService.registerUsuario(createUsuarioDto);
  }
}
