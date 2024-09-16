import { Module } from '@nestjs/common';
import { AttibutesService } from './attibutes.service';
import { AttibutesController } from './attibutes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attibute } from './entities/attibute.entity';
import { Table } from '../table/entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attibute, Table])],
  controllers: [AttibutesController],
  providers: [AttibutesService],
})
export class AttibutesModule {}
