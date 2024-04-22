import { IUser } from '@quo-pro/commons';
import { IsString, IsOptional, IsBoolean, IsEmail, ValidateIf } from 'class-validator';

type TExclude = Omit<IUser, 'followed' | 'createdAt' | 'updatedAt' | '_id' | 'roles' | 'emailVerified' | 'followed' | 'followCount' | 'userName'>

export class UpsertUserDto implements TExclude {
    @IsOptional()
    @IsString()
    statusMessage: string;

    @IsOptional()
    @ValidateIf(o => o.email !== undefined)
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    displayName: string;

    @IsOptional()
    @IsString()
    profilePhoto: string;

    @IsOptional()
    @IsBoolean()
    eulaAccepted: boolean;

    @IsOptional()
    @IsBoolean()
    isActive: boolean;
}
