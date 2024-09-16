import { Injectable } from '@nestjs/common';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Relation } from './entities/relation.entity';

@Injectable()
export class RelationsService {
  constructor(
    @InjectRepository(Relation)
    private readonly relationRepository: Repository<Relation>,
  ) {}
  create(createRelationDto: CreateRelationDto) {
    const relacion = this.relationRepository.create(createRelationDto);
    return this.relationRepository.save(relacion);
  }

  findAll() {
    return this.relationRepository.find();
  }

  findOne(id: number) {
    return this.relationRepository.findOneBy({ id });
  }

  update(id: number, updateRelationDto: UpdateRelationDto) {
    return `This action updates a #${id} relation`;
  }

  remove(id: number) {
    return this.relationRepository.delete(id);
  }
}
