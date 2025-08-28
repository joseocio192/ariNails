import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class GenericTableAttributes {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    fechaCreacion: Date;
    
    @UpdateDateColumn()
    fechaActualizacion: Date;

    @Column({ default: true })
    estaActivo: boolean;
}
