import { Injectable } from '@nestjs/common';
import { CreateAttibuteDto } from './dto/create-attibute.dto';
import { UpdateAttibuteDto } from './dto/update-attibute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attibute } from './entities/attibute.entity';
import { Repository } from 'typeorm';
import { Table } from '../table/entities/table.entity';

@Injectable()
export class AttibutesService {
  constructor(
    @InjectRepository(Attibute)
    private readonly attibuteRepository: Repository<Attibute>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}
  async create(createAttibuteDto: CreateAttibuteDto) {
    const { name, type, tableId } = createAttibuteDto;
    const table = await this.tableRepository.findOneBy({ id: tableId });
    if (!table) {
      throw new Error('Tabla no encontrada');
    }

    const attibute = this.attibuteRepository.create({
      name,
      type,
      table,
    });

    return this.attibuteRepository.save(attibute);
  }

  findAll() {
    return this.attibuteRepository.find({ relations: ['table'] });
  }

  findOne(id: number) {
    return this.attibuteRepository.findOne({ where: { id }, relations: ['table'] });
  }

  update(id: number, updateAttibuteDto: UpdateAttibuteDto) {
    return `This action updates a #${id} attibute`;
  }

  remove(id: number) {
    return this.attibuteRepository.delete(id);
  }
}
