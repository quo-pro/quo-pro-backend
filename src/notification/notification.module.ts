import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
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
  exports: [NotificationService],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule { }
