import { WebsocketEvent } from './websocket-event';

export interface WebsocketControllerOptions {
  namespace: WebsocketEvent<any>['namespace'];
  type?: WebsocketEvent<any>['type'];
}
