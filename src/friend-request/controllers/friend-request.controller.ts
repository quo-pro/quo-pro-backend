import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FriendRequestService } from '../services/friend-request.service';
import { Request } from 'express';
import { CreateFriendRequest } from '../dtos/createFriendRequestDto';
import { UpdateFriendRequestDto } from '../dtos/updateFriendRequestDto';

@ApiTags('FriendRequest')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('friend-requests')
export class FriendRequestController {
  constructor(private readonly service: FriendRequestService) { }

  @Get()
  @ApiOperation({ summary: 'Get pending friend requests' })
  async getFriendRequests(
    @Req() request: Request,
  ) {
    return this.service.getAll(request.query as any, request.user);
  }

  @Post()
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiBody({ type: CreateFriendRequest })
  createFriendRequest(@Body() payload: CreateFriendRequest, @Req() request: Request) {
    return this.service.createFriendRequest(payload, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update friend request' })
  @ApiBody({ type: UpdateFriendRequestDto })
  updateFriendRequestStatus(@Param('id') id: string, @Body() payload: UpdateFriendRequestDto, @Req() request: Request,) {
    return this.service.updateFriendRequestStatus(id, payload, request.user);
  }
}
