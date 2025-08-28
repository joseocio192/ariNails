import { Controller, Post, Body } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
const IResponse = require('../utils/IResponse.handle');

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/cliente')
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuarioService.registerUsuarioCliente(createUsuarioDto);
    return IResponse(usuario, 'cliente registrado exitosamente', true);
  }
}
