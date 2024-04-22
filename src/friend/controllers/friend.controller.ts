import { Controller, Delete, Get, Param, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FriendService } from '../services/friend.service';
import { Request } from 'express';


@ApiTags('Friend')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('friends')
export class FriendController {
  constructor(private readonly service: FriendService) { }

  @Get()
  @ApiOperation({ summary: 'Get friend list for a user' })
  async getFriends(
    @Req() request: Request,
  ) {
    return this.service.getAll(request.query as any, request.user);
  }

  @Delete(':friend')
  @ApiOperation({ summary: 'Unfriend a user' })
  async unfriendUser(@Param("friend") id: string, @Req() request: Request) {
    return this.service.unfriendUser(id, request.user);
  }
}
