import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpsertUserDto } from '../dtos/upsert-user.dto';
import { IBlockedUser, IQuery, IQueryResponse, IUser } from '@quo-pro/commons';
import { BlockedUserModel, FriendModel, FriendRequestModel, UserModel } from '@quo-pro/database-connect';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(private eventEmitter: EventEmitter2) { }

  async publicUser(query: IQuery<IUser>): Promise<IQueryResponse<IUser> | Error> {
    try {
      const { limit = 30, page = 1, sort_by = 'createdAt', order_by = 'desc', search_value } = query;

      const conditions = {
        ...(search_value && { displayName: new RegExp(search_value, 'i') })
      };

      const totalRecords = await UserModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await UserModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      });

      return {
        totalPages,
        totalRecords,
        totalRecordsPerPage: limit,
        currentPage: page,
        data
      };

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAll(query: IQuery<IUser>, user: IUser): Promise<IQueryResponse<IUser> | Error> {
    try {
      const { limit = 30, page = 1, sort_by = 'createdAt', order_by = 'desc', search_value } = query;

      const blockedFriends = await BlockedUserModel.find({ blockedBy: user._id, }).distinct('blockedUser');

      // Exclude blocked users
      const conditions = {
        _id: { $nin: blockedFriends },
        ...(search_value && { displayName: new RegExp(search_value, 'i') })
      };

      const totalRecords = await UserModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const users = await UserModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      });

      const friendIDs = await FriendModel.find({ user: user._id }).distinct('friend');
      const friendRequestIDs = (await FriendRequestModel.find({ sender: user._id, status: 'PENDING' }).distinct('receiver')).toString();
      const friendRequests = await FriendRequestModel.find({ sender: user._id });

      const data = users.map(record => ({
        ...record.toObject(),
        isFriend: friendIDs.includes(record._id.toString()),
        isPendingFriendRequest: friendRequestIDs.includes(record._id.toString()),
        friendRequestId: friendRequests.find((request) => (request.receiver as any).toString() === record._id.toString())?._id,
        isLoggedInUser: record._id.toString() === user._id.toString()
      })) as unknown as IUser[];

      return {
        totalPages,
        totalRecords,
        totalRecordsPerPage: limit,
        currentPage: page,
        data
      };

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateUser(payload: UpsertUserDto, user: IUser): Promise<IUser | Error> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: user._id },
        payload,
        {
          new: true,
        }
      );

      if (payload.statusMessage) {
        this.eventEmitter.emit('user.statusMessage.updated', updatedUser)
      }

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async blockUser(userToBlock: string, user: IUser): Promise<IBlockedUser> {
    try {
      return BlockedUserModel.create({ blockedBy: user._id, blockedUser: userToBlock });
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async getUser(userName: string): Promise<IBlockedUser> {
    return UserModel.findOne({ userName })
  }
}