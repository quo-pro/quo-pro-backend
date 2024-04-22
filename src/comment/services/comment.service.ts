import { Injectable, InternalServerErrorException, } from '@nestjs/common';
import { CommentModel } from '@quo-pro/database-connect';
import { IComment, IQuery, IQueryResponse, IUser } from '@quo-pro/commons';
import { UpsertCommentDto } from '../dto/upsertCommentDto';

@Injectable()
export class CommentService {
  constructor() { }

  async getAll(_id: string, query: IQuery<IComment>): Promise<IQueryResponse<IComment> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', startDate, endDate } = query;

      const conditions = {
        _id,
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      };

      const totalRecords = await CommentModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await CommentModel.find(conditions, null, {
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


  async create(postId: string, payload: UpsertCommentDto, user: IUser): Promise<IComment> {
    try {
      const newComment = await CommentModel.create({
        ...payload,
        user: user._id,
        post: postId
      });
      return newComment;

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(_id: string, payload: UpsertCommentDto, user: IUser): Promise<IComment> {
    try {
      const updatedComment = await CommentModel.findOneAndUpdate(
        {
          _id,
          user: user._id,
        },
        payload,
        { new: true }
      )

      return updatedComment;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async delete(_id: string, user: IUser): Promise<any> {
    try {
      const result = await CommentModel.findOneAndDelete({ _id, user: user._id });
      return result
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
