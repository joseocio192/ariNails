import { Controller} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
const IResponse = require('../utils/IResponse.handle');

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

}
