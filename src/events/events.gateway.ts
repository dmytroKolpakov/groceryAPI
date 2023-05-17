import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventType } from './types/events.type';
import { IListResult } from 'src/list/interfaces/list-result.interface';
import * as _ from 'lodash';

@WebSocketGateway({
  // namespace: 'socket.io',
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Sockets initialized');
  }

  handleConnection(client: Socket) {

  };

  customEmit(deviceIds: Array<string>, product: IListResult, type: EventType, exclude?: string) {
    (exclude && exclude.trim() !== '' ? deviceIds.filter(i => i !== exclude) : deviceIds)?.map(id => {
      this.server.emit(`list-${type}-${id}`, { ..._.omit(product, '__v') });
    });
  };
}
