import { Module } from '@nestjs/common';
import { FriendService } from './services/friend.service';
import { FriendController } from './controllers/friend.controller';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule { }
