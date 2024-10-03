import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RoomUser } from 'src/room-user/entities/room-user.entity'; // Tabla intermedia

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Código único para que los usuarios se unan

  @Column()
  name: string; // Nombre de la sala

  @ManyToOne(() => User, (user) => user.createdRooms, { nullable: false })
  creator: User; // El creador de la sala

  @OneToMany(() => RoomUser, (roomUser) => roomUser.room)
  participants: RoomUser[]; // Participantes de la sala
  // Relación con TablaEntidad

  @Column({ default: false })
  isActive: boolean; // Para saber si la sala está activa o finalizada

  @Column({ type: 'text', nullable: true })
  diagram_data: string; // Aquí almacenamos el XML o JSON del diagrama
  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
