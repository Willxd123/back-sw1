import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { RoomUserService } from './room-user.service';
import { CreateRoomUserDto } from './dto/create-room-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('room-user')
@UseGuards(AuthGuard)  // Asegurarse de que el usuario esté autenticado
export class RoomUserController {
  constructor(private readonly roomUserService: RoomUserService) {}

  // Endpoint para unirse a una sala
  @Post('join')
  async joinRoom(
    @Body() createRoomUserDto: CreateRoomUserDto, 
    @ActiveUser() user: UserActiveInterface
  ) {
    return this.roomUserService.joinRoomByCode(createRoomUserDto.code, user);
  }
  @Get(':roomId')
  findUsersInRoom(@Param('roomId') roomId: number) {
    return this.roomUserService.findUsersInRoom(roomId);
  }
}
