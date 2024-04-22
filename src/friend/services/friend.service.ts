import { Injectable, InternalServerErrorException, } from '@nestjs/common';
import { BlockedUserModel, FriendModel, FriendRequestModel, UserModel } from '@quo-pro/database-connect';
import { IQuery, IQueryResponse, IUser } from '@quo-pro/commons';

@Injectable()
export class FriendService {
  constructor() { }

  async getAll(query: IQuery<IUser>, user: IUser): Promise<IQueryResponse<IUser> | Error> {
    try {
      const { limit = 30, page = 1, sort_by = 'createdAt', order_by = 'desc', search_value } = query;

      const blockedFriends = await BlockedUserModel.find({ blockedBy: user._id, }).distinct('blockedUser');
      const followers = await FriendModel.find({ friend: user._id }).distinct('user');
      const following = await FriendModel.find({ user: user._id }).distinct('friend');

      const conditions = {
        _id: {
          $in: [...followers, following]
        },
        ...(search_value && { displayName: new RegExp(search_value, 'i') })
      };

      const totalRecords = await UserModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const users = await UserModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      });

      const data = users.map(user => ({
        ...user.toObject(),
        isFollower: followers.toString().includes(user._id.toString()),
        isFollowing: following.toString().includes(user._id.toString()),
        isBlocked: blockedFriends.toString().includes(user._id.toString()),
      })) as unknown as IUser[];

      return {
        totalPages,
        totalRecords,
        totalRecordsPerPage: limit,
        currentPage: page,
        data
      };

    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error);
    }
  }

  async unfriendUser(friend: string, user: IUser): Promise<any> {
    try {
      const result = await FriendModel.findOneAndDelete({ friend, user: user._id });
      const request = await FriendRequestModel.findOneAndDelete({ sender: user._id, receiver: result.friend });
      await UserModel.findOneAndUpdate({ _id: request.receiver, followCount: { $gte: 1 } }, { $inc: { followCount: -1 } });

      return result
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
