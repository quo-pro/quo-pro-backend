import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FRIEND_REQUEST_STATUS_LIST, FRIEND_REQUEST_STATUS_TYPE, IFriendRequest } from '@quo-pro/commons';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFriendRequestDto implements Pick<IFriendRequest, 'status'> {
    @ApiProperty({
        required: true,
        enum: FRIEND_REQUEST_STATUS_LIST,
        type: 'string'
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(FRIEND_REQUEST_STATUS_LIST)
    status: FRIEND_REQUEST_STATUS_TYPE;
}
