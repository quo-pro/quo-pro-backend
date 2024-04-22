import { ApiProperty } from '@nestjs/swagger';
import { INotification, NOTIFICATION_LIST, NOTIFICATION_STATUS_TYPE } from '@quo-pro/commons';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class UpsertNotificationDto implements Pick<INotification, 'status'> {
    @ApiProperty({
        description: 'Mutate notification status',
        enum: NOTIFICATION_LIST
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(NOTIFICATION_LIST)
    status: NOTIFICATION_STATUS_TYPE

}