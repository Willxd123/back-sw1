import { PartialType } from '@nestjs/mapped-types';
import { CreateRelationTableDto } from './create-relation-table.dto';

export class UpdateRelationTableDto extends PartialType(CreateRelationTableDto) {}
