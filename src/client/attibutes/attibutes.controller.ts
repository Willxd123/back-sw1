import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttibutesService } from './attibutes.service';
import { CreateAttibuteDto } from './dto/create-attibute.dto';
import { UpdateAttibuteDto } from './dto/update-attibute.dto';

@Controller('attibutes')
export class AttibutesController {
  constructor(private readonly attibutesService: AttibutesService) {}

  @Post()
  create(@Body() createAttibuteDto: CreateAttibuteDto) {
    return this.attibutesService.create(createAttibuteDto);
  }

  @Get()
  findAll() {
    return this.attibutesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attibutesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAttibuteDto: UpdateAttibuteDto) {
    return this.attibutesService.update(+id, updateAttibuteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attibutesService.remove(+id);
  }
}
