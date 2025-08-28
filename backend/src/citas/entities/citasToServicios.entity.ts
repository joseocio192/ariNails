import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cita } from "./cita.entity";
import { Servicio } from "../../servicios/entities/servicio.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";

@Entity()
export class CitasToServicios extends GenericTableAttributes {
    @ManyToOne(() => Cita, (cita) => cita.citasToServicios, { nullable: false })
    cita: Cita;

    @ManyToOne(() => Servicio, (servicio) => servicio.citasToServicios, { nullable: false })
    servicio: Servicio;
}