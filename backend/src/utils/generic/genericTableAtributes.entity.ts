import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class GenericTableAttributes {
  @PrimaryGeneratedColumn({ comment: 'Identificador único del registro' })
  id: number;

  @CreateDateColumn({
    nullable: false,
    comment: 'Fecha de creación del registro',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    nullable: false,
    comment: 'Fecha de la última actualización del registro',
  })
  fechaActualizacion: Date;

  @Column({
    nullable: false,
    comment: 'Usuario que realizó la creación del registro',
  })
  usuarioIdCreacion: number;

  @Column({
    nullable: false,
    comment: 'Usuario que realizó la última actualización del registro',
  })
  usuarioIdActualizacion: number;

  @Column({
    default: true,
    nullable: false,
    comment: 'Indica si el registro está activo o inactivo',
  })
  estaActivo: boolean;
}
