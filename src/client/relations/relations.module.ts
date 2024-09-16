import { Module } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { RelationsController } from './relations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relation } from './entities/relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Relation])],
  controllers: [RelationsController],
  providers: [RelationsService],
})
export class RelationsModule {}
