import { Relation } from "src/client/relations/entities/relation.entity";
import { Table } from "src/client/table/entities/table.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RelationTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Table, table => table.relations)
  id_table: Table;

  @ManyToOne(() => Relation, (relation) => relation.relationTable)
  id_relation: Relation;

  @Column()
  descripcion: string;
}
