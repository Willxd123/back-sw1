import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table } from './entities/table.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from 'src/rooms/entities/room.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,  // Repositorio de Sala
  ) {}
  async create(createTableDto: CreateTableDto) {
    const { name, roomId } = createTableDto;
    // Buscar la sala donde se creará la tabla
    const room = await this.roomRepository.findOneBy({ id: roomId });
    if (!room) {
      throw new Error('Sala no encontrada');
    }
    // Crear la nueva tabla y asociarla a la sala
    const table = this.tableRepository.create({ 
      name,
      room
    });
    return this.tableRepository.save(table);
  }

  findAll() {
    return this.tableRepository.find({ relations: ['room'] });
  }

  findOne(id: number) {
    return this.tableRepository.findOne({ where: { id }, relations: ['room'] });
  }

  update(id: number, updateTableDto: UpdateTableDto) {
    return `This action updates a #${id} table`;
  }

  remove(id: number) {
    return this.tableRepository.delete(id);
  }
}
