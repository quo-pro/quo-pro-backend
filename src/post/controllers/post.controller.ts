import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PostService } from '../services/post.service';
import { UpsertPostDto } from '../dto/upsertPostDto';

@ApiTags('Post')
@ApiHeader({
  name: 'access-token',
  description: 'Access Token',
  required: true,
})
@Controller('posts')
export class PostController {
  constructor(private readonly service: PostService) { }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  async getPosts(@Req() request: Request) {
    return this.service.getAll(request.query as any, request.user);
  }

  @Get("public")
  @ApiOperation({ summary: 'Get all posts' })
  async getPublicPosts(@Req() request: Request) {
    return this.service.getPublicPosts(request.query as any);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(@Body() payload: UpsertPostDto, @Req() request: Request) {
    return this.service.create(payload, request.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  async updatePost(@Param('id') id: string, @Body() payload: UpsertPostDto, @Req() request: Request) {
    return this.service.update(id, payload, request.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(@Param('id') id: string, @Req() request: Request) {
    return this.service.delete(id, request.user);
  }
}
