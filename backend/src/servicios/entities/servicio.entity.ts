import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiciosToRoles } from './serviciosToRoles.entity';
import { CitasToServicios } from 'src/citas/entities/citasToServicios.entity';
import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';

@Entity()
export class Servicio extends GenericTableAttributes {
  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'varchar', length: 50, default: 'basico' })
  categoria: string; // 'basico' o 'extra'

  @OneToMany(
    () => ServiciosToRoles,
    (serviciosToRoles) => serviciosToRoles.servicio,
  )
  serviciosToRoles: ServiciosToRoles[];

  @OneToMany(
    () => CitasToServicios,
    (citasToServicios) => citasToServicios.servicio,
  )
  citasToServicios: CitasToServicios[];
}
