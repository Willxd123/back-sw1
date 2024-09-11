import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomUser } from './entities/room-user.entity';
import { RoomUserService } from 'src/room-user/room-user.service';
import { RoomUserController } from './room-user.controller';
import { User } from 'src/users/entities/user.entity';
import { Room } from 'src/rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomUser, User, Room])],
  controllers: [RoomUserController],
  providers: [RoomUserService],
})
export class RoomUserModule {}
