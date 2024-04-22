import { ApiProperty } from '@nestjs/swagger';
import { IComment } from '@quo-pro/commons';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpsertCommentDto implements Pick<IComment, 'content'> {
    @ApiProperty({
        description: 'ID of the post'
    })
    @IsString()
    @IsNotEmpty()
    post: string;

    @ApiProperty({
        description: 'Comment content'
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}