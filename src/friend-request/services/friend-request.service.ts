import { CreateFriendRequest } from '../dtos/createFriendRequestDto';
import { Injectable, InternalServerErrorException, ConflictException, } from '@nestjs/common';
import { FriendModel, FriendRequestModel, NotificationModel, UserModel } from '@quo-pro/database-connect';
import { IFriendRequest, IQuery, IQueryResponse, IUser } from '@quo-pro/commons';
import { UpdateFriendRequestDto } from '../dtos/updateFriendRequestDto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FriendRequestService {
  constructor(private eventEmitter: EventEmitter2) { }

  async getAll(query: IQuery<IFriendRequest>, user: IUser): Promise<IQueryResponse<IFriendRequest> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', status = 'PENDING', startDate, endDate } = query;

      const conditions = {
        receiver: user._id,
        status,
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      };

      const totalRecords = await FriendRequestModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await FriendRequestModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      }).populate('sender');

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

  async createFriendRequest(addFriendRequestDto: CreateFriendRequest, user: IUser): Promise<IFriendRequest> {
    const { receiver } = addFriendRequestDto;

    const requestExist = await FriendRequestModel.findOne({
      sender: user._id,
      receiver: receiver
    });

    if (requestExist) {
      throw new ConflictException('REQUEST_EXIST');
    }

    try {
      const request = await FriendRequestModel.create({
        sender: user._id,
        receiver,
        status: 'PENDING'
      });

      this.eventEmitter.emit('friend-request.created', request)

      return request;
    } catch (error) {
      throw new InternalServerErrorException('Failed to add friend');
    }
  }

  async updateFriendRequestStatus(_id: string, updateFriendRequestStatusDto: UpdateFriendRequestDto, user: IUser): Promise<IFriendRequest> {
    const { status } = updateFriendRequestStatusDto;

    try {
      switch (status) {
        case 'PENDING':
          const pending = await FriendRequestModel.findOneAndUpdate({ _id, sender: user._id }, { status });
          this.eventEmitter.emit('friend-request.created', pending);

          return pending;
        case 'WITHDRAWN':
          const withdrawn = await FriendRequestModel.findOneAndDelete({ _id, sender: user._id }, { new: true });
          this.eventEmitter.emit('friend-request.withdrawn', withdrawn);

          return withdrawn;
        case 'ACCEPTED':
          const accepted = await FriendRequestModel.findOneAndUpdate({ _id, receiver: user._id }, { status });
          await FriendModel.create({ friend: user._id, user: accepted.sender });
          await UserModel.findOneAndUpdate({ _id: user._id }, { $inc: { followCount: 1 } });
          await NotificationModel.findOneAndUpdate({ triggerRecordId: accepted._id }, { status: 'READ' });

          this.eventEmitter.emit('friend-request.accepted', accepted);

          return accepted;
        case 'REJECTED':
          const rejected = await FriendRequestModel.findOneAndDelete({ _id, receiver: user._id }, { new: true });
          this.eventEmitter.emit('friend-request.rejected', rejected);

          return rejected;
      }

    } catch (error) {
      throw new InternalServerErrorException('UPDATE_FAILED');
    }
  }
}
