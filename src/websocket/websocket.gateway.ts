import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { INotification } from '@quo-pro/commons';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/api/v1/events',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private authService: AuthService) { }

    async handleConnection(client: Socket) {
        const accessToken = client.handshake.query['access-token'] || client.handshake.headers['access-token'];
        if (!accessToken) {
            console.error("Connection attempt without access token.");
            client.emit('error', 'ACCESS_TOKEN_REQUIRED');
            client.disconnect(true);
            return;
        }

        try {
            const user = await this.authService.validateToken(accessToken.toString());
            client.data.user = user;
            console.log("New client connected", client.id);
        } catch (error) {
            console.error("Invalid token provided:", accessToken);
            client.emit('error', 'INVALID_TOKEN');
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected', client.id);
    }

    @OnEvent('friend-request-notification')
    async notifyOnFriendRequestNotification(notification: INotification) {
        const user = notification.user as any
        this.server.emit(user.toString(), notification);
        console.log("Notification sent to:", notification.user);
    }

    @OnEvent('statusUpdate-notification.created')
    async notifyOnStatusUpdateNotification(notification: INotification) {
        const user = notification.user as any
        this.server.emit(user.toString(), notification);
        console.log("Notification sent to:", notification.user);
    }
}
