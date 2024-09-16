import { Attibute } from 'src/client/attibutes/entities/attibute.entity';
import { Operation } from 'src/client/operations/entities/operation.entity';
import { Position } from 'src/client/positions/entities/position.entity';
import { RelationTable } from 'src/client/relation-table/entities/relation-table.entity';
import { Room } from 'src/rooms/entities/room.entity';

import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Relación con Sala
  @ManyToOne(() => Room, (room) => room.table, { nullable: false })
  room: Room; // Relacionar la tabla con una sala

  @OneToMany(() => Attibute, (attibute) => attibute.table)
  attibutes: Attibute[];

  @OneToMany(() => Operation, (operation) => operation.table)
  operations: Operation[];

  @OneToMany(() => RelationTable, (relationTable) => relationTable.id_table)
  relations: RelationTable[];

  @OneToMany(() => Position, (position) => position.table)
  position: Position[];
}
