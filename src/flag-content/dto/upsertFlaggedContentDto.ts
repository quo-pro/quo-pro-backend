import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { FLAG_REASONS, FLAG_REASON_TYPE, FLAG_STATUSES, FLAG_STATUS_TYPE } from '@quo-pro/commons';

export class UpsertFlaggedContentDto {
    @IsOptional()
    @ApiProperty({ description: 'ID of the post being flagged' })
    @IsMongoId()
    @IsNotEmpty()
    post: string;

    @IsOptional()
    @ApiProperty({ description: 'Reason for flagging the post', enum: FLAG_REASONS })
    @IsEnum(FLAG_REASONS)
    reason: FLAG_REASON_TYPE;

    @IsOptional()
    @ApiProperty({ description: 'Detailed description of the reason for flagging' })
    @IsString()
    @IsNotEmpty()
    details: string;

    @IsOptional()
    @ApiProperty({ description: 'New status of the flagged content', enum: FLAG_STATUSES })
    @IsEnum(FLAG_STATUSES)
    status: FLAG_STATUS_TYPE;
}