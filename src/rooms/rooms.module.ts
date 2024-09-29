import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { UsersModule } from '../users/users.module';  // Verifica que esta ruta sea correcta
import { AuthModule } from '../auth/auth.module';  // Verifica que esta ruta sea correcta
import { RoomUser } from 'src/room-user/entities/room-user.entity';
import { RoomsGateway } from './rooms.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomUser]),
    forwardRef(() => UsersModule),  // Si hay una dependencia circular con UsersModule
    forwardRef(() => AuthModule),   // Si hay una dependencia circular con AuthModule
  ],
  providers: [RoomsService, RoomsGateway],
  controllers: [RoomsController],
})
export class RoomsModule {}
