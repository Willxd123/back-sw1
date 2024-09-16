import { Module } from '@nestjs/common';
import { RelationTableService } from './relation-table.service';
import { RelationTableController } from './relation-table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationTable } from './entities/relation-table.entity';
import { Table } from '../table/entities/table.entity';
import { Relation } from '../relations/entities/relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RelationTable, Table, Relation])],
  controllers: [RelationTableController],
  providers: [RelationTableService],
})
export class RelationTableModule {}
