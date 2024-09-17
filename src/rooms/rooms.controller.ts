import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';


@Roles(Role.USER)
@UseGuards(AuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Auth(Role.USER)  // Aseguramos que solo usuarios autenticados puedan crear salas
  create(
    @Body() createRoomDto: CreateRoomDto,
    @ActiveUser() user: UserActiveInterface  // Obtenemos el usuario autenticado
  ) {
    return this.roomsService.create(createRoomDto, user);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  // Endpoint para obtener los detalles de una sala por su código
  @Get(':code')
  async findRoomByCode(@Param('code') code: string) {
    const room = await this.roomsService.findRoomByCode(code);
    if (!room) {
      throw new NotFoundException('Sala no encontrada');
    }
    return room;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
