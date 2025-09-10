import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Cita } from 'src/citas/entities/cita.entity';
import { GenericTableAttributes } from 'src/utils/generic/genericTableAtributes.entity';
@Entity()
export class Cliente extends GenericTableAttributes {
  @Column()
  telefono: string;

  @Column()
  direccion: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.clientes, { nullable: false })
  usuario: Usuario;

  @OneToMany(() => Cita, (cita) => cita.cliente)
  citas: Cita[];
}
