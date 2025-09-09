import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty({ type: String, example: 'admin' })
	username: string;

	@ApiProperty({ type: String, example: 'admin123456' })
	pass: string;
}
