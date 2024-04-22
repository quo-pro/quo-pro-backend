import { Injectable, InternalServerErrorException, } from '@nestjs/common';
import { FlaggedContentModel, FriendModel, PostModel } from '@quo-pro/database-connect';
import { IPost, IQuery, IQueryResponse, IUser } from '@quo-pro/commons';
import { UpsertPostDto } from '../dto/upsertPostDto';

@Injectable()
export class PostService {
  async getAll(query: IQuery<IPost>, user: IUser): Promise<IQueryResponse<IPost> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', startDate, endDate } = query;

      const followers = await FriendModel.find({ friend: user._id }).distinct("friend");
      const following = await FriendModel.find({ user: user._id }).distinct("user");
      const flaggedContents = await FlaggedContentModel.find({ flaggedBy: user._id }).distinct("post")

      const conditions = {
        _id: {
          $nin: flaggedContents
        },
        $or: [
          {
            visibility: {
              $in: ['FRIENDS']
            },
            user: {
              $in: [
                ...followers,
                ...following
              ]
            },
          },
          {
            visibility: {
              $in: ['PUBLIC']
            },
          },
          {
            visibility: {
              $in: ['PRIVATE']
            },
          }
        ],
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      };

      const totalRecords = await PostModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await PostModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      }).populate('user');

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

  async getPublicPosts(query: IQuery<IPost>): Promise<IQueryResponse<IPost> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', startDate, endDate, user } = query;

      const conditions = {
        visibility: 'PUBLIC',
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
        ...(user ? { user } : {}),
      };

      const totalRecords = await PostModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await PostModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      }).populate('user');

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

  async create(payload: UpsertPostDto, user: IUser): Promise<IPost> {
    try {
      const newPost = await PostModel.create({
        ...payload,
        user: user._id,
      });

      return newPost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, payload: UpsertPostDto, user: IUser): Promise<IPost> {
    const post = await PostModel.findOneAndUpdate(
      { _id: id, user: user._id },
      payload,
      { new: true }
    );

    return post;
  }

  async delete(id: string, user: IUser): Promise<any> {
    const result = await PostModel.findOneAndDelete({ _id: id, user: user._id });

    // Decide if to delete comment for the post.
    return result;
  }



  async createReport(id: string, user: IUser): Promise<any> {
    const result = await PostModel.findOneAndDelete({ _id: id, user: user._id });

    // Decide if to delete comment for the post.
    return result;
  }
}
