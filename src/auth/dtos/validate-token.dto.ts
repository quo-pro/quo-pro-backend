import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTokenDto {
  @ApiProperty({
    description: 'Token',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
