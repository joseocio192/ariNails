import { Entity, ManyToOne } from 'typeorm';
import { Servicio } from './servicio.entity';
import { Rol } from 'src/usuario/entities/rol.entityt';
import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';
@Entity()
export class ServiciosToRoles extends GenericTableAttributes {
  @ManyToOne(() => Servicio, (servicio) => servicio.serviciosToRoles, {
    nullable: false,
  })
  servicio: Servicio;

  @ManyToOne(() => Rol, (rol) => rol.serviciosToRoles, { nullable: false })
  rol: Rol;
}
