import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketGatewayModule } from './websocket/websocket.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendRequestController } from './friend-request/controllers/friend-request.controller';
import { FriendController } from './friend/controllers/friend.controller';
import { NotificationController } from './notification/controllers/notification.controller';
import { FriendModule } from './friend/friend.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { PostController } from './post/controllers/post.controller';
import { CommentModule } from './comment/comment.module';
import { CommentController } from './comment/controllers/comment.controller';
import { UserController } from './user/controllers/user.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    WebSocketGatewayModule,
    FriendModule,
    FriendRequestModule,
    NotificationModule,
    PostModule,
    CommentModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/users/public', method: RequestMethod.GET },
        { path: '/posts/public', method: RequestMethod.GET },
        { path: '/users/public/(.*)', method: RequestMethod.GET }
      )
      .forRoutes(
        FriendController,
        FriendRequestController,
        NotificationController,
        PostController,
        CommentController,
        UserController
      );
  }
}