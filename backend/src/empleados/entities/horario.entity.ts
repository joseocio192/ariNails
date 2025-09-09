import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Empleado } from './empleado.entity';

@Entity()
export class Horario extends GenericTableAttributes {
  @Column({ type: 'timestamp' })
  desde: Date;

  @Column({ type: 'timestamp' })
  hasta: Date;

  @ManyToOne(() => Empleado, (empleado) => empleado.horarios, {
    nullable: false,
  })
  empleado: Empleado;
}
