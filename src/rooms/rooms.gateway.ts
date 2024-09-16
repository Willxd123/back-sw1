import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Método que se ejecuta al inicializar el Gateway
  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  // Método que se ejecuta cuando un cliente se conecta
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Método que se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Método para unirse a una sala
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    client.emit('joinedRoom', room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  // Método para enviar un mensaje a todos los usuarios en una sala
  @SubscribeMessage('sendDiagramUpdate')
  handleDiagramUpdate(@MessageBody() data: any) {
    const { room, diagramData } = data;
    this.server.to(room).emit('receiveDiagramUpdate', diagramData);
  }
}
