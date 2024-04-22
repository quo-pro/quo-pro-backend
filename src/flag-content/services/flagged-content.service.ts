import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FlaggedContentModel } from '@quo-pro/database-connect';
import { IFlaggedContent, IQuery, IQueryResponse, IUser } from '@quo-pro/commons';
import { UpsertFlaggedContentDto } from '../dto/upsertFlaggedContentDto';

@Injectable()
export class FlaggedContentService {
  async getAll(query: IQuery<IFlaggedContent>): Promise<IQueryResponse<IFlaggedContent> | Error> {
    try {
      const { limit = 100, page = 1, sort_by = 'createdAt', order_by = 'desc', startDate, endDate } = query;

      const conditions = {
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } }),
      };

      const totalRecords = await FlaggedContentModel.countDocuments(conditions);
      const totalPages = Math.ceil(totalRecords / limit);

      const data = await FlaggedContentModel.find(conditions, null, {
        skip: (page - 1) * limit,
        limit: limit,
        sort: { [sort_by]: order_by === 'desc' ? -1 : 1 }
      });

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

  async createFlaggedContent(dto: UpsertFlaggedContentDto, user: IUser): Promise<IFlaggedContent> {
    try {
      const newFlag = await FlaggedContentModel.create({
        ...dto,
        flaggedBy: user._id,
        status: 'PENDING'
      });
      return newFlag;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create flagged content', error.message);
    }
  }

  async updateFlaggedContentStatus(id: string, dto: UpsertFlaggedContentDto): Promise<IFlaggedContent> {
    try {
      const updatedFlag = await FlaggedContentModel.findByIdAndUpdate(
        id,
        { $set: { status: dto.status } },
        { new: true }
      );
      if (!updatedFlag) {
        throw new NotFoundException('Flagged content not found');
      }
      return updatedFlag;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update flagged content', error.message);
    }
  }

  async deleteFlaggedContent(id: string): Promise<void> {
    try {
      const result = await FlaggedContentModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Flagged content not found');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete flagged content', error.message);
    }
  }
}
