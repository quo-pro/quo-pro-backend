import { ApiProperty } from '@nestjs/swagger';
import { IAuth, IUser } from '@quo-pro/commons';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto implements Pick<IAuth, 'UUID' | 'userName'> {
  @ApiProperty({
    description: "A user name",
    example: 'abc@gmail.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    required: true,
    description: "UUID stored in client side",
  })
  @IsString()
  UUID: string;
}
