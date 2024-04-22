import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { Request } from 'express';
import { NOTIFICATION_STATUS_TYPE } from '@quo-pro/commons';
import { UpsertNotificationDto } from '../dto/upsertNotificationDto';

@ApiTags('Notification')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) { }

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(
    @Req() request: Request,
  ) {
    return this.service.getAll(request.query as any, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notifications' })
  @ApiBody({ type: UpsertNotificationDto })
  updateNotificationStatus(@Param('id') id: string, @Body() payload: { status: NOTIFICATION_STATUS_TYPE }, @Req() request: Request,) {
    return this.service.updateNotificationStatus(id, payload.status, request.user);
  }
}
