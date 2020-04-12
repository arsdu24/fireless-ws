import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from './types';
import { WebSocketStream } from './stream';
import { Subject } from 'rxjs';
import { Server, ServerOptions } from 'ws';
import { AbstractModule } from '@fireless/core';
import WebSocket = require('ws');

type EventMethods = Omit<WebsocketEvent<any>, 'data' | 'namespace' | 'type'>;
type EventDetails<T extends {}> = Pick<
  WebsocketEvent<T>,
  'data' | 'namespace' | 'type'
>;

export class WebSocketModule extends AbstractModule<
  ServerOptions,
  WebsocketEvent<any>,
  WebsocketControllerOptions,
  WebSocketControllerHandlerOptions<any>
> {
  pipeSocketToStream<T = any>(
    subscriber: Subject<WebsocketEvent<T>>,
    socket: WebSocket,
  ) {
    const socketMethods: EventMethods = {
      reject: (error) => this.sendErrorToSocket(socket, error),
      resolve: (data) => this.sendDataToSocket(socket, data),
    };

    subscriber.next({
      ...socketMethods,
      namespace: '_ws_',
      type: 'connected',
      data: {} as T,
    });

    socket.on('message', (raw: string | Buffer) => {
      try {
        subscriber.next({
          ...socketMethods,
          ...this.prepareData(JSON.parse(`${raw}`)),
        });
      } catch (e) {
        console.log(`Received unprocessable message '${raw}'`);
      }
    });

    socket.on('close', () => {
      subscriber.next({
        ...socketMethods,
        namespace: '_ws_',
        type: 'disconnected',
        data: {} as T,
      });
    });
  }

  prepareData<T extends {}>(raw: any): EventDetails<T> {
    const namespace: EventDetails<T>['namespace'] =
      raw.namespace || '_unknown_';
    const type: EventDetails<T>['type'] = raw.type || 'unknown';
    let data: T = raw;

    if (raw.namespace || raw.type) {
      data = raw.data || {};
    }

    return {
      namespace,
      type,
      data,
    };
  }

  sendErrorToSocket(socket: WebSocket, error: string | Error) {
    socket.send(
      JSON.stringify({
        error,
      }),
    );
  }

  sendDataToSocket<T extends object>(socket: WebSocket, data: T) {
    socket.send(
      JSON.stringify({
        data,
      }),
    );
  }

  protected async createStream(
    options: ServerOptions,
  ): Promise<WebSocketStream> {
    let server: Server | undefined;
    await new Promise<void>((resolve, reject) => {
      server = new Server(options);

      server.on('listening', resolve);
      server.on('error', reject);
    });

    const subject: Subject<WebsocketEvent<any>> = new Subject();

    if (server) {
      server.on('connection', (socket: WebSocket) =>
        this.pipeSocketToStream(subject, socket),
      );
    }

    return new WebSocketStream(subject.asObservable());
  }
}
