import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Rol } from "./rol.entityt";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Empleado } from "src/empleados/entities/empleado.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";
import { Exclude } from "class-transformer";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
@Entity()
export class Usuario extends GenericTableAttributes {
    @Column()
    nombres: string;

    @Column()
    apellidoPaterno: string;

    @Column()
    apellidoMaterno: string;

    @Column()
    usuario: string;

    @Column()
    email: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password: string;

    @ManyToOne(() => Rol, rol => rol.usuarios, { nullable: false })
    rol: Rol;

    @OneToMany(() => Cliente, cliente => cliente.usuario)
    clientes?: Cliente[];

    @OneToMany(() => Empleado, empleado => empleado.usuario)
    empleados?: Empleado[];

    
  @BeforeInsert()
  async hashPassword() {
    if (this.password && this.password.trim() !== '' && this.password.length >= 8) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }else{
      if (!this.password || this.password.trim() === '') {
        throw new BadRequestException('Password must be provided');
      }else{
        throw new BadRequestException('Password must be at least 8 characters long');
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!password || password.trim() === '' || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!this.password) {
      throw new BadRequestException('Password must be provided');
    }
    return bcrypt.compare(password, this.password);
  }
}
