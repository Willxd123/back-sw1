import { PartialType } from '@nestjs/mapped-types';
import { CreateAttibuteDto } from './create-attibute.dto';

export class UpdateAttibuteDto extends PartialType(CreateAttibuteDto) {}
