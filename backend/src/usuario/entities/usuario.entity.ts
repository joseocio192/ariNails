import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Rol } from "./rol.entityt";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Empleado } from "src/empleados/entities/empleado.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";
@Entity()
export class Usuario extends GenericTableAttributes {
    @Column()
    nombres: string;

    @Column()
    apellidoPaterno: string;

    @Column()
    apellidoMaterno: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @ManyToOne(() => Rol, rol => rol.usuarios, { nullable: false })
    rol: Rol;

    @OneToMany(() => Cliente, cliente => cliente.usuario)
    clientes?: Cliente[];

    @OneToMany(() => Empleado, empleado => empleado.usuario)
    empleados?: Empleado[];
}
