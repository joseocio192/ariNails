import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ServiciosModule } from './servicios/servicios.module';
import { ClientesModule } from './clientes/clientes.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { CitasModule } from './citas/citas.module';
import { StripeModule } from './stripe/stripe.module';
import { HorariosModule } from './horarios/horarios.module';
import { SeederModule } from './seeder/seeder.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsuarioModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ServiciosModule,
    ClientesModule,
    EmpleadosModule,
    CitasModule,
    HorariosModule,
    SeederModule,
    StripeModule.forRootAsync(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'postgres',
    });
  }
}
