import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity('disenos_unas')
export class DisenoUna extends GenericTableAttributes {
  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  imagenUrl: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'empleado_id_creador', type: 'int' })
  empleadoIdCreador: number;

  @ManyToOne(() => Usuario, { eager: false })
  @JoinColumn({ name: 'empleado_id_creador' })
  empleadoCreador: Usuario;
}
