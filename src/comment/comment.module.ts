import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { CommentController } from 'src/comment/controllers/comment.controller';
import { CommentService } from 'src/comment/services/comment.service';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule { }
