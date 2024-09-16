import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomUser } from './entities/room-user.entity';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { CreateRoomUserDto } from './dto/create-room-user.dto';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class RoomUserService {
  constructor(
    @InjectRepository(RoomUser)
    private readonly roomUserRepository: Repository<RoomUser>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  // Método para agregar un usuario a una sala
  /*   async addUserToRoom(userId: number, createRoomUserDto: CreateRoomUserDto) {
    const { code } = createRoomUserDto;
  
    const room = await this.roomRepository.findOne({ where: { code } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
  
    const numericUserId = Number(userId);  // Asegúrate de que es un número
    if (isNaN(numericUserId)) {
      throw new BadRequestException('Invalid user ID');
    }
  
    const existingRoomUser = await this.roomUserRepository.findOne({
      where: { user: { id: numericUserId }, room: { id: room.id } },
    });
  
    if (existingRoomUser) {
      throw new Error('User is already in the room');
    }
  
    const roomUser = this.roomUserRepository.create({
      user: { id: numericUserId },
      room,
    });
  
    return this.roomUserRepository.save(roomUser);
  }
   */
  // Método para que un usuario se una a una sala usando el código
  async joinRoomByCode(code: string, user: UserActiveInterface) {
    // Verificar si la sala existe usando el código
    const room = await this.roomRepository.findOne({
      where: { code },
    });

    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }

    // Verificar si el usuario ya está en la sala
    const existingRoomUser = await this.roomUserRepository.findOne({
      where: { room: { id: room.id }, user: { id: user.id } },
    });

    if (existingRoomUser) {
      throw new BadRequestException('Ya estás en la sala');
    }

    // Buscar el usuario autenticado por su `id`
    const foundUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!foundUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Agregar al usuario a la sala
    const roomUser = this.roomUserRepository.create({
      room,
      user: foundUser,
    });

    await this.roomUserRepository.save(roomUser);

    return { message: 'Usuario agregado a la sala exitosamente', room };
  }

  // Método para listar todos los usuarios en una sala
  async findUsersInRoom(roomId: number) {
    return this.roomUserRepository.find({
      where: { room: { id: roomId } },
      relations: ['user'],
    });
  }
}
