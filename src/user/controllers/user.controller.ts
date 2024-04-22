import {
  Body,
  Controller,
  Get,
  Req,
  Patch,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpsertUserDto } from '../dtos/upsert-user.dto';
import { Request } from 'express';

@ApiTags('Users')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) { }

  @Get()
  @ApiOperation({ summary: 'Get platform users' })
  async getUsers(
    @Req() request: Request,
  ) {
    return this.service.getAll(request.query as any, request.user);
  }

  @Get('public')
  async publicUser(@Req() req: Request) {
    return this.service.publicUser(req.query as any);
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @Patch(":id")
  @ApiBody({
    type: UpsertUserDto,
    description: 'Update a user',
  })
  async updateUser(@Body() payload: UpsertUserDto, @Req() req: Request) {
    return this.service.updateUser(payload, req.user);
  }

  @Post(":id/block")
  @ApiBody({
    type: UpsertUserDto,
    description: 'Block a user',
  })
  async blockUser(@Param("id") id: string, @Req() req: Request) {
    console.log({ id })
    return this.service.blockUser(id, req.user);
  }

  @Delete(":id/unblock")
  @ApiBody({
    type: UpsertUserDto,
    description: 'unblock a user',
  })
  async unblockUser(@Param("id") id: string, @Req() req: Request) {
    return this.service.unblockUser(id, req.user);
  }


  @Get("public/:userName")
  @ApiBody({
    type: UpsertUserDto,
    description: 'Get a user',
  })
  async getUser(@Param("userName") userName: string, @Req() req: Request) {
    return this.service.getUser(userName);
  }
}