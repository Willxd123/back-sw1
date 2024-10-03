import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // Permitir el acceso desde cualquier origen, ajustar según sea necesario
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly jwtService: JwtService,
  ) {}

  // Verificar conexión de un cliente
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const user = this.jwtService.verify(token);
    client.data.user = user;
    console.log(`Usuario conectado: ${user.email}`);
  }

  // Método para manejar la desconexión de un cliente
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    console.log(
      `Cliente desconectado: ${client.id}, Usuario: ${user?.email || 'desconocido'}`,
    );

    // Emite el evento de desconexión
    if (user) {
      this.server.emit('userDisconnected', { email: user.email });
    }
  }

  // Crear una nueva sala con Socket.IO
  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() createRoomDto: CreateRoomDto,
  ) {
    try {
      const user = client.data.user;
      if (!user) throw new Error('Usuario no autenticado');

      const room = await this.roomsService.create(createRoomDto, user);
      client.join(room.code); // Unirse a la sala
      client.emit('roomCreated', room); // Enviar confirmación al cliente

      console.log(`Sala creada: ${room.name}, código: ${room.code}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Unirse a una sala existente
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomCode') roomCode: string,
  ) {
    try {
      const user = client.data.user;
      const room = await this.roomsService.findByCode(roomCode);
      if (!room) throw new Error('Sala no encontrada');
      // Verificar si el usuario ya está en la sala
      const existingRoomUser = await this.roomsService.findRoomUser(
        user.id,
        room.id,
      );
      if (!existingRoomUser) {
        // Si no está en la sala, agregarlo como 'participant'
        await this.roomsService.addUserToRoom(user.id, room.id);
      }

      // Unirse a la sala en el socket
      client.join(roomCode);
      this.server.to(roomCode).emit('newUserJoined', { email: user.email });
      // Enviar el diagrama almacenado al cliente
     
      // Obtener la lista de usuarios conectados y emitir a todos
      const usersInRoom =
        await this.getUsersInRoomWithConnectionStatus(roomCode);
      this.server.to(roomCode).emit('updateUsersList', usersInRoom);

      client.emit('joinedRoom', room);

      console.log(`Usuario ${user.email} se unió a la sala: ${roomCode}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Obtener usuarios conectados
  private async getUsersInRoomWithConnectionStatus(roomCode: string) {
    // Obtener todos los usuarios de la base de datos
    const allUsers = await this.roomsService.getAllUsersInRoom(roomCode);

    // Obtener los usuarios actualmente conectados al socket
    const connectedClients = Array.from(
      this.server.sockets.adapter.rooms.get(roomCode) || [],
    );

    // Actualizar el estado de conexión para cada usuario
    return allUsers.map((user) => ({
      email: user.email,
      name: user.name,
      isConnected: connectedClients.some(
        (clientId) =>
          this.server.sockets.sockets.get(clientId)?.data.user.email ===
          user.email,
      ),
    }));
  }
  //salir de una sala
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomCode') roomCode: string,
  ) {
    const user = client.data.user;
    // El usuario deja la sala
    client.leave(roomCode);

    client.emit('leftRoom', { roomCode });
    // Emitir el estado desconectado y actualizar la lista
    this.server.to(roomCode).emit('userLeft', { email: user.email });
    this.getUsersInRoomWithConnectionStatus(roomCode).then((usersInRoom) => {
      this.server.to(roomCode).emit('updateUsersList', usersInRoom);
    });

    console.log(`Usuario ${user.email} salió de la sala: ${roomCode}`);
  }
  //-------------------diagrama
  @SubscribeMessage('addClass')
  async handleAddClass(
    @ConnectedSocket() client: Socket,
    @MessageBody() newClassData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = newClassData.roomCode;
    const classData = newClassData.classData;

    // Verificar que los datos están siendo recibidos
    console.log(`Clase recibida en el servidor: ${JSON.stringify(classData)}`);

    // Emitir a todos los usuarios conectados en esa sala
    this.server.to(roomCode).emit('classAdded', classData);
    console.log(
      `Usuario ${user.email} agregó una clase en la sala: ${roomCode}`,
    );
  }
  //------------posicion
  @SubscribeMessage('updateClassPositionAndSize')
  async handleClassPositionAndSizeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateData: any,
  ) {
    const roomCode = updateData.roomCode;
    const classData = updateData.classData;

    // Obtener el nombre del usuario que actualizó la clase
    const user = client.data.user;

    console.log(
      `Actualización de posición recibida para la clase con key ${classData.key} del usuario ${user.email}.`,
    );

    // Emitir la actualización de posición a todos los usuarios conectados en la sala
    this.server.to(roomCode).emit('classPositionAndSizeUpdated', {
      classData,
      user: user.email, // Incluir el email del usuario que realizó la actualización
    });
  }
  //---------------atributo
  @SubscribeMessage('addAttribute')
  async handleAddAttribute(
    @ConnectedSocket() client: Socket,
    @MessageBody() attributeData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = attributeData.roomCode;
    const classKey = attributeData.classKey;
    const attributeName = attributeData.attributeName;
    const attributeReturnType = attributeData.attributeReturnType;

    console.log(
      `Atributo recibido para la clase con key ${classKey} del usuario ${user.email}.`,
    );

    // Emitir la adición del atributo a todos los usuarios conectados en la sala
    this.server.to(roomCode).emit('attributeAdded', {
      classKey,
      attributeName,
      attributeReturnType,
      user: user.email, // Incluir el email del usuario que realizó la actualización
    });
  }
  @SubscribeMessage('removeAttribute')
  async handleRemoveAttribute(
    @ConnectedSocket() client: Socket,
    @MessageBody() attributeData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = attributeData.roomCode;
    const classKey = attributeData.classKey;
    const attributeName = attributeData.attributeName;

    console.log(
      `Atributo a eliminar de la clase con key ${classKey} recibido del usuario ${user.email}.`,
    );

    // Emitir la eliminación del atributo a todos los usuarios conectados en la sala
    this.server.to(roomCode).emit('attributeRemoved', {
      classKey,
      attributeName,
      user: user.email, // Incluir el email del usuario que realizó la eliminación
    });
  }
  //----------------metodo
  @SubscribeMessage('addMethod')
  async handleAddMethod(
    @ConnectedSocket() client: Socket,
    @MessageBody() methodData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = methodData.roomCode;
    const classKey = methodData.classKey;
    const methodName = methodData.methodName;
    const methodReturnType = methodData.methodReturnType;

    console.log(
      `Método recibido para la clase con key ${classKey} del usuario ${user.email}.`,
    );

    // Emitir la adición del método a todos los usuarios conectados en la sala
    this.server.to(roomCode).emit('methodAdded', {
      classKey,
      methodName,
      methodReturnType,
      user: user.email, // Incluir el email del usuario que realizó la actualización
    });
  }
  @SubscribeMessage('removeMethod')
  async handleRemoveMethod(
    @ConnectedSocket() client: Socket,
    @MessageBody() methodData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = methodData.roomCode;
    const classKey = methodData.classKey;
    const methodName = methodData.methodName;

    console.log(
      `Método a eliminar de la clase con key ${classKey} recibido del usuario ${user.email}.`,
    );

    // Emitir la eliminación del método a todos los usuarios conectados en la sala
    this.server.to(roomCode).emit('methodRemoved', {
      classKey,
      methodName,
      user: user.email, // Incluir el email del usuario que realizó la eliminación
    });
  }
  //nombre de la clase;
  @SubscribeMessage('updateClassName')
  async handleUpdateClassName(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = updateData.roomCode;
    const classData = updateData.classData;

    // Emitir el cambio de nombre a todos los usuarios de la sala
    this.server.to(roomCode).emit('classNameUpdated', classData);
    console.log(
      `El usuario ${user.email} actualizó el nombre de la clase con key ${classData.key} a ${classData.name} en la sala ${roomCode}.`,
    );
  }

  // Método para manejar la creación de relaciones de asociación

  @SubscribeMessage('createRelationship')
  handleCreateRelationship(
    @ConnectedSocket() client: Socket,
    @MessageBody() relationshipData: any,
  ) {
    const roomCode = relationshipData.roomCode;
    const linkData = relationshipData.linkData;

    // Emitir el evento de creación de relación a todos los usuarios en la sala
    this.server.to(roomCode).emit('relationshipCreated', linkData);

    console.log(
      `Relación de tipo ${linkData.relationType} creada en la sala ${roomCode}: ${JSON.stringify(linkData)}`,
    );
  }
  // En el controlador de sockets del backend
  @SubscribeMessage('createManyToMany')
  handleCreateManyToMany(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const roomCode = data.roomCode;

    // Emitir el evento de creación de relación a todos los usuarios en la sala
    this.server.to(roomCode).emit('manyToManyCreated', {
      intermediateClass: data.intermediateClass,
      fromIntermediateLinkData: data.fromIntermediateLinkData,
      toIntermediateLinkData: data.toIntermediateLinkData,
    });

    console.log(
      `Relación muchos a muchos creada en la sala ${roomCode}: ${JSON.stringify(data)}`,
    );
  }
  //eliminar clase
  @SubscribeMessage('deleteClass')
  async handleDeleteClass(
    @ConnectedSocket() client: Socket,
    @MessageBody() deleteData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');

    const roomCode = deleteData.roomCode;
    const classKey = deleteData.classKey;

    // Emitir el evento de eliminación de clase a todos los usuarios en la sala
    this.server.to(roomCode).emit('classDeleted', classKey);
    console.log(
      `El usuario ${user.email} eliminó la clase con key ${classKey} en la sala ${roomCode}.`,
    );
  }
  @SubscribeMessage('deleteRelationship')
  handleDeleteRelationship(
    @ConnectedSocket() client: Socket,
    @MessageBody() relationshipData: any,
  ) {
    const user = client.data.user;
    if (!user) throw new Error('Usuario no autenticado');
    const roomCode = relationshipData.roomCode;
    const linkData = relationshipData.linkData;

    // Emitir el evento de eliminación de enlace a todos los usuarios en la sala
    this.server.to(roomCode).emit('relationshipDeleted', linkData);

    console.log(
      `Enlace entre ${linkData.from} y ${linkData.to} eliminado en la sala ${roomCode}, por el usuario ${user.email}.`,
    );
  }
  @SubscribeMessage('updateAttributeText')
async handleUpdateAttributeText(
  @ConnectedSocket() client: Socket,
  @MessageBody() attributeData: any,
) {
  const user = client.data.user;
  if (!user) throw new Error('Usuario no autenticado');

  const roomCode = attributeData.roomCode;
  const classKey = attributeData.classKey;
  const updatedAttribute = attributeData.updatedAttribute;
  const oldAttributeName = attributeData.oldAttributeName;

  // Emite la actualización a todos los usuarios en la sala
  this.server.to(roomCode).emit('attributeUpdated', {
    classKey,
    oldAttributeName,
    updatedAttribute,
    user: user.email,  // Para identificar quién hizo la actualización
  });
}

}
