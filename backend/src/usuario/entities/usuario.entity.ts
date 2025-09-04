import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Rol } from "./rol.entityt";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { Empleado } from "src/empleados/entities/empleado.entity";
import { GenericTableAttributes } from "src/utils/generic/genericTableAtributes.entity";
import { Exclude } from "class-transformer";
import { BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
@Entity()
export class Usuario extends GenericTableAttributes {
    @Column({nullable: false, comment: 'Nombres del usuario'})
    nombres: string;

    @Column({nullable: false, comment: 'Apellido paterno del usuario'})
    apellidoPaterno: string;

    @Column({nullable: false, comment: 'Apellido materno del usuario'})
    apellidoMaterno: string;

    @Column({nullable: false, comment: 'Nombre de usuario'})
    usuario: string;

    @Column({nullable: false, comment: 'Email del usuario'})
    email: string;

    @Column({nullable: false, comment: 'Contraseña del usuario'})
    @Exclude({ toPlainOnly: true })
    password: string;

    @Column({nullable: false, comment: 'Rol del usuario'})
    rol_id: number;

    @ManyToOne(() => Rol, rol => rol.usuarios, { nullable: false })
    @JoinColumn({ name: 'rol_id' })
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
