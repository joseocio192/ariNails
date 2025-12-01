import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisenosController } from './disenos.controller';
import { DisenosService } from './disenos.service';
import { DisenoUna } from './entities/diseno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DisenoUna])],
  controllers: [DisenosController],
  providers: [DisenosService],
  exports: [DisenosService],
})
export class DisenosModule {}
