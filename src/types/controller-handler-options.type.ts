import { WebsocketEvent } from './websocket-event';

export interface WebSocketControllerHandlerOptions<T extends {}> {
  pipeResponse?: boolean;
  type?: WebsocketEvent<T>['type'];
  match?: { [key in keyof T]: T[key] | RegExp | ((data: T[key]) => boolean) };
  filters?: ((event: WebsocketEvent<T>) => boolean)[];
}
