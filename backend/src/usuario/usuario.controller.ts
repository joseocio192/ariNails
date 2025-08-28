import { Controller, Post, Body } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
const IResponse = require('../utils/IResponse.handle');

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/cliente')
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return IResponse(await this.usuarioService.registerUsuarioCliente(createUsuarioDto), 'cliente registrado exitosamente', true);
  }
}
