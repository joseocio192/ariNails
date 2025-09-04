import { Controller, Post, Body, Put } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
const IResponse = require('../utils/IResponse.handle');

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/cliente')
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuarioService.registerUsuarioCliente(createUsuarioDto);
    return IResponse(usuario, 'cliente registrado exitosamente', true);
  }

  @Put('/cliente' )
  async update(@Body() updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioService.updateUsuarioCliente(updateUsuarioDto);
    return IResponse(usuario, 'cliente actualizado exitosamente', true);
  }

}