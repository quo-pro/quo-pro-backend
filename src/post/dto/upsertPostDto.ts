import { ApiProperty } from '@nestjs/swagger';
import { IPost, POST_VISIBILITY, POST_VISIBILITY_TYPE } from '@quo-pro/commons';
import { IsString, IsNotEmpty, IsEnum, IsArray, IsOptional } from 'class-validator';

export class UpsertPostDto implements Pick<IPost, 'content' | 'visibility' | 'media' | 'editorContent'> {
    @IsOptional()
    @ApiProperty({ description: 'Post content in string' })
    @IsArray()
    @IsNotEmpty()
    editorContent: Array<any>;

    @IsOptional()
    @ApiProperty({ description: 'Post content in string' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @ApiProperty({ description: 'Post media URI' })
    @IsArray()
    @IsNotEmpty()
    media: string[];

    @IsOptional()
    @ApiProperty({ description: 'Post visibility', enum: POST_VISIBILITY })
    @IsEnum(POST_VISIBILITY)
    visibility: POST_VISIBILITY_TYPE;
}