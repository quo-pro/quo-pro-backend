import { Injectable, InternalServerErrorException, } from '@nestjs/common';
import { FriendModel, NotificationModel } from '@quo-pro/database-connect';
import { IFriendRequest, INotification, IQuery, IQueryResponse, IUser, NOTIFICATION_STATUS_TYPE } from '@quo-pro/commons';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(private eventEmitter: EventEmitter2) { }

  async getAll(query: IQuery<INotification>, user: IUser): Promise<IQueryResponse<INotification> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', status = 'UNREAD', startDate, endDate } = query;

      const conditions = {
        user: user._id,
        status,
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      };

      const totalRecords = await NotificationModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await NotificationModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      }).populate('sentBy');

      return {
        totalPages: totalPages,
        totalRecords: totalRecords,
        totalRecordsPerPage: limit,
        currentPage: page,
        data: data
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @OnEvent('friend-request.created')
  async notifyOnFriendRequestCreated(friendRequest: IFriendRequest) {
    const record = await this.createNotification({
      message: 'FRIEND_REQUEST_NOTIFICATION_TITLE',
      triggerRecordId: friendRequest._id,
      type: 'NEW_FRIEND_REQUEST',
      user: friendRequest.receiver,
      sentBy: friendRequest.sender,
      status: 'UNREAD'
    });

    this.eventEmitter.emit('friend-request-notification', record);
  }

  @OnEvent('friend-request.withdrawn')
  async deleteOnFriendRequestWithdrawn(friendRequest: IFriendRequest) {
    await NotificationModel.findOneAndDelete({ ref: friendRequest._id });
    this.eventEmitter.emit('friend-request-notification', { user: friendRequest.receiver, type: 'GHOST' });
  }

  @OnEvent('friend-request.accepted')
  async notifyOnFriendRequestAccepted(friendRequest: IFriendRequest) {
    const record = await this.createNotification({
      message: 'FRIEND_REQUEST_ACCEPTED_NOTIFICATION_TITLE',
      triggerRecordId: friendRequest._id,
      type: 'ACCEPTED_FRIEND_REQUEST',
      user: friendRequest.sender,
      sentBy: friendRequest.receiver,
      status: 'UNREAD'
    });

    this.eventEmitter.emit('friend-request-notification', record);
    this.eventEmitter.emit('friend-request-notification', {
      user: record.user, type: 'GHOST'
    });
  }

  @OnEvent('friend-request.rejected')
  async deleteOnFriendRequestRejected(friendRequest: IFriendRequest) {
    await NotificationModel.findOneAndDelete({ ref: friendRequest._id });
    this.eventEmitter.emit('friend-request-notification', { user: friendRequest.receiver, type: 'GHOST' });
  }

  async createNotification(payload: Omit<INotification, 'createdAt' | 'updatedAt' | '_id'>): Promise<INotification> {
    try {
      return NotificationModel.create({ ...payload, status: 'UNREAD' });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Bulk creates notifications for a list of users.
   * @param notifications Array of notification payloads.
   */
  async bulkCreateNotifications(notifications: Omit<INotification, 'createdAt' | 'updatedAt' | '_id'>[]): Promise<INotification[]> {
    try {
      const createdNotifications = await NotificationModel.insertMany(notifications);
      createdNotifications.forEach(notification => {
        this.eventEmitter.emit('statusUpdate-notification.created', notification);
      });

      return createdNotifications;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateNotificationStatus(notificationId: string, status: NOTIFICATION_STATUS_TYPE, user: IUser): Promise<INotification> {
    try {
      const updatedNotification = await NotificationModel.findOneAndUpdate(
        { _id: notificationId, user: user._id },
        { status },
        { new: true }
      );

      return updatedNotification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @OnEvent('user.statusMessage.updated')
  async notifyOnUserStatusUpdate(user: IUser) {
    const friends: string[] = await FriendModel.find({ friend: user._id }).distinct("user");

    // Find efficient solution by using channel -> then emit to channel
    const notifications: Omit<INotification, 'createdAt' | 'updatedAt' | '_id'>[] =
      friends.map(f => ({
        user: f as unknown as IUser,
        sentBy: user._id.toString() as unknown as IUser,
        type: 'STATUS_UPDATE',
        triggerRecordId: user._id.toString(),
        message: user.statusMessage,
        status: 'UNREAD'
      }));

    this.bulkCreateNotifications(notifications)
  }
}
