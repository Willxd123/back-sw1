
import { Table } from "src/client/table/entities/table.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  top: number;

  @Column()
  left: number;

  @Column()
  width: number;

  @Column()
  height: number;

  @ManyToOne(() => Table, (table) => table.position)
  table: Table;
}
