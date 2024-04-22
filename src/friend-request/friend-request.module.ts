import { Module } from '@nestjs/common';
import { FriendRequestService } from './services/friend-request.service';
import { FriendRequestController } from './controllers/friend-request.controller';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    EventEmitterModule.forRoot()
  ],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
})
export class FriendRequestModule { }
