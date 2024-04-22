import { Module } from '@nestjs/common';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule { }
