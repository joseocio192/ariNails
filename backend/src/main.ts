import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Habilitar CORS primero para que aplique a todos los recursos
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3001', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Servir archivos estáticos desde public/uploads con prefix /uploads/
  app.useStaticAssets(join(__dirname, '..', 'public', 'uploads'), {
    prefix: '/uploads/',
    // Habilitar CORS para archivos estáticos
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });
  
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('AriNails API')
    .setDescription(
      'API completa para la gestión de citas, empleados, clientes y servicios de AriNails',
    )
    .setVersion('1.0')
    .addTag('citas', 'Gestión de citas y reservas')
    .addTag('Horarios', 'Gestión de horarios y disponibilidad')
    .addTag('servicios', 'Gestión de servicios ofrecidos')
    .addTag('empleados', 'Gestión de empleados')
    .addTag('clientes', 'Gestión de clientes')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('usuarios', 'Gestión de usuarios del sistema')
    .addBearerAuth()
    .build();
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res: any) => {
    res.status(200).json({ status: 'OK' });
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  console.log(`Server running on port ${process.env.PORT ?? 3000}`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
