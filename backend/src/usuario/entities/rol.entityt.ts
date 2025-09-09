import { Column, Entity, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { ServiciosToRoles } from 'src/servicios/entities/serviciosToRoles.entity';
import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';
@Entity()
export class Rol extends GenericTableAttributes {
  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @OneToMany(() => ServiciosToRoles, (serviciosToRoles) => serviciosToRoles.rol)
  serviciosToRoles?: ServiciosToRoles[];
}
