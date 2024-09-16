import { Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Table } from '../table/entities/table.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}
  async create(createPositionDto: CreatePositionDto) {
    const { top, left, width, height, tableId } = createPositionDto;

    const table = await this.tableRepository.findOneBy({ id: tableId });
    if (!table) {
      throw new Error('Tabla no encontrada');
    }
    const position = this.positionRepository.create({
      top,
      left,
      width,
      height,
      table,
    });

    return this.positionRepository.save(position);
  }

  findAll() {
    return this.positionRepository.find({ relations: ['table'] });
  }

  findOne(id: number) {
    return this.positionRepository.findOne({ where: { id }, relations: ['table'] });
  }

  update(id: number, updatePositionDto: UpdatePositionDto) {
    return `This action updates a #${id} position`;
  }

  remove(id: number) {
    return this.positionRepository.delete(id);
  }
}
