import { IsEmail, IsString } from "class-validator";

export class CreateUsuarioDto {
    @IsString()
    nombres: string;

    @IsString()
    apellidoPaterno: string;

    @IsString()
    apellidoMaterno: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
