import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { FlaggedContentService } from '../services/flagged-content.service';
import { UpsertFlaggedContentDto } from '../dto/upsertFlaggedContentDto';
import { Request } from 'express';

// TODO: Add Role Guards

@ApiTags('FlaggedContents')
@Controller('flagged-contents')
export class FlaggedContentController {
  constructor(private readonly service: FlaggedContentService) { }

  @Get()
  @ApiOperation({ summary: 'Get all flagged content' })
  async getFlaggedContents(@Query() query: any) {
    return this.service.getAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a flagged content' })
  @ApiBody({ type: UpsertFlaggedContentDto })
  async createFlaggedContent(@Body() dto: UpsertFlaggedContentDto, @Req() req: Request) {
    return this.service.createFlaggedContent(dto, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flagged content status' })
  @ApiBody({ type: UpsertFlaggedContentDto })
  async updateFlaggedContentStatus(@Param('id') id: string, @Body() dto: UpsertFlaggedContentDto) {
    return this.service.updateFlaggedContentStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete flagged content' })
  async deleteFlaggedContent(@Param('id') id: string) {
    await this.service.deleteFlaggedContent(id);
    return { message: 'Flagged content deleted successfully' };
  }
}
