import { ApiProperty } from '@nestjs/swagger';
import { IPost, POST_VISIBILITY, POST_VISIBILITY_TYPE } from '@quo-pro/commons';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class UpsertPostDto implements Pick<IPost, 'content' | 'visibility'> {
    @ApiProperty({ description: 'Post content in string' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'Post visibility', enum: POST_VISIBILITY })
    @IsEnum(POST_VISIBILITY)
    visibility: POST_VISIBILITY_TYPE;
}