import { Injectable } from '@nestjs/common';
import { CreateRelationTableDto } from './dto/create-relation-table.dto';
import { UpdateRelationTableDto } from './dto/update-relation-table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RelationTable } from './entities/relation-table.entity';
import { Table } from '../table/entities/table.entity';
import { Relation } from '../relations/entities/relation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RelationTableService {
  constructor(
    @InjectRepository(RelationTable)
    private readonly relationTableRepository: Repository<RelationTable>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Relation)
    private readonly relationRepository: Repository<Relation>,
  ) {}

  async create(createRelationTableDto: CreateRelationTableDto) {
    const { tableId, relationId, descripcion } = createRelationTableDto;

    // Obtener las tablas origen y destino
    const table = await this.tableRepository.findOneBy({ id: tableId });
    const relation = await this.relationRepository.findOneBy({ id: relationId });

    if (!table || !relation) {
      throw new Error('Alguno de los elementos no fue encontrado');
    }

    // Crear el registro en RelationTable
    const relationTabla = this.relationTableRepository.create({
      id_table: table,  // Utilizamos id_table, que es el nombre correcto de la propiedad
      id_relation: relation,  // Utilizamos id_relation
      descripcion,
    });

    return this.relationTableRepository.save(relationTabla);
  }

  findAll() {
    return this.relationTableRepository.find({ relations: ['id_table', 'id_relation', 'descripcion'] });
  }

  findOne(id: number) {
    return this.relationTableRepository.findOne({ where: { id }, relations: ['id_table', 'id_relation', 'descripcion']});
  }

  update(id: number, updateRelationTableDto: UpdateRelationTableDto) {
    return `This action updates a #${id} relationTable`;
  }

  remove(id: number) {
    return `This action removes a #${id} relationTable`;
  }
}
