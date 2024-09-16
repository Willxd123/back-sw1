import { RelationTable } from "src/client/relation-table/entities/relation-table.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Relation {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column()
    figuraSimbolo: string;
  
    @OneToMany(() => RelationTable, relationTable => relationTable.id_relation)
    relationTable: RelationTable[];
}
