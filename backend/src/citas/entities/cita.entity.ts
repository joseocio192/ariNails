import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Empleado } from "src/empleados/entities/empleado.entity";
import { CitasToServicios } from "./citasToServicios.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";
@Entity()
export class Cita extends GenericTableAttributes {
    @Column({ type: 'time', nullable: true })
    startTime: string;

    @Column({ type: 'time', nullable: true })
    endTimeExpected: string;

    @Column({ type: 'time', nullable: true })
    endTime: string;

    @Column()
    fecha: Date;

    @Column()
    hora: string;

    @Column("decimal", { precision: 10, scale: 2 })
    precio: number;

    @Column("decimal", { precision: 10, scale: 2 })
    precioFull: number;

    @Column("decimal", { precision: 10, scale: 2 })
    descuento: number;

    @Column("decimal", { precision: 10, scale: 2 })
    precioFinal: number;

    @Column({ default: false })
    canceled: boolean;

    @Column({ nullable: true })
    cancellationReason: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.citas, { nullable: false })
    cliente: Cliente;

    @ManyToOne(() => Empleado, (empleado) => empleado.citas, { nullable: true })
    empleado: Empleado;

    @OneToMany(() => CitasToServicios, (citasToServicios) => citasToServicios.cita)
    citasToServicios: CitasToServicios[];
}