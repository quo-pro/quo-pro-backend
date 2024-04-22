import { Controller, Get, Post, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CommentService } from '../services/comment.service';
import { UpsertCommentDto } from '../dto/upsertCommentDto';

@ApiTags('Comment')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly service: CommentService) { }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a single post' })
  async getComments(@Param("postId") postId: string, @Req() request: Request) {
    return this.service.getAll(postId, request.query as any);
  }

  @Post()
  @ApiOperation({ summary: 'Create a comment on a post' })
  async createComment(@Param("postId") postId: string, @Body() payload: UpsertCommentDto, @Req() request: Request) {
    return this.service.create(postId, payload, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  async updateComment(@Param("id") id: string, @Body() payload: UpsertCommentDto, @Req() request: Request) {
    return this.service.update(id, payload, request.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@Param("id") id: string, @Req() request: Request) {
    return this.service.delete(id, request.user);
  }
}
