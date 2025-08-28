import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Cita } from "src/citas/entities/cita.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";
import { Horario } from "./horario.entity";

@Entity()
export class Empleado extends GenericTableAttributes {
    @Column()
    telefono: string;

    @Column()
    direccion: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.empleados, { nullable: false })
    usuario: Usuario;

    @OneToMany(() => Cita, (cita) => cita.empleado)
    citas: Cita[];

    @OneToMany(() => Horario, (horario) => horario.empleado)
    horarios: Horario[];
}