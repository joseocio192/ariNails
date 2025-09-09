import { Controller } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { ApiTags } from '@nestjs/swagger';
const IResponse = require('./utils/IResponse.handle');

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}
}
