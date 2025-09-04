import { Controller} from '@nestjs/common';
import { ClientesService } from './clientes.service';
const IResponse = require('../utils/IResponse.handle');

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

}
