import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RelationTableService } from './relation-table.service';
import { CreateRelationTableDto } from './dto/create-relation-table.dto';
import { UpdateRelationTableDto } from './dto/update-relation-table.dto';

@Controller('relation-table')
export class RelationTableController {
  constructor(private readonly relationTableService: RelationTableService) {}

  @Post()
  create(@Body() createRelationTableDto: CreateRelationTableDto) {
    return this.relationTableService.create(createRelationTableDto);
  }

  @Get()
  findAll() {
    return this.relationTableService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relationTableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRelationTableDto: UpdateRelationTableDto) {
    return this.relationTableService.update(+id, updateRelationTableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relationTableService.remove(+id);
  }
}
