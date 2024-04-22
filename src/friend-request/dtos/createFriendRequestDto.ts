import { ApiProperty } from '@nestjs/swagger';
import { IFriendRequest, IUser } from '@quo-pro/commons';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendRequest {
    @ApiProperty({
        description: 'The ID of the user to whom the friend request is being sent'
    })
    @IsNotEmpty()
    @IsString()
    receiver: string;
}
