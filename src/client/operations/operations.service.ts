import { Injectable } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from './entities/operation.entity';
import { Table } from '../table/entities/table.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}
  async create(createOperationDto: CreateOperationDto) {
    const { name, tableId } = createOperationDto;

    const table = await this.tableRepository.findOneBy({ id: tableId });
    if (!table) {
      throw new Error('Tabla no encontrada');
    }

    const operation = this.operationRepository.create({
      name,
      table,
    });

    return this.operationRepository.save(operation);
  }

  findAll() {
    return this.operationRepository.find({ relations: ['tabla'] });
  }

  findOne(id: number) {
    return this.operationRepository.findOne({ where: { id }, relations: ['tabla'] });
  }

  update(id: number, updateOperationDto: UpdateOperationDto) {
    return `This action updates a #${id} operation`;
  }

  remove(id: number) {
    return this.operationRepository.delete(id);
  }
}
