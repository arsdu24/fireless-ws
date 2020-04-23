import { Class } from 'utility-types';
import {
  KlassMethodDecorator,
  setControllerHandlerContextOptions,
} from '@fireless/common';
import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from '../types';

export function Handler<D extends {}>(
  type: WebSocketControllerHandlerOptions<D>['type'],
): KlassMethodDecorator;
export function Handler<D extends {}>(
  options: WebSocketControllerHandlerOptions<D>,
): KlassMethodDecorator;
export function Handler<D extends {}>(
  typeOrOptions:
    | WebSocketControllerHandlerOptions<D>
    | WebSocketControllerHandlerOptions<D>['type'],
) {
  return <T extends {}>(target: T, methodName: keyof T): void => {
    const options: WebSocketControllerHandlerOptions<D> =
      'object' === typeof typeOrOptions
        ? typeOrOptions
        : { type: typeOrOptions };

    setControllerHandlerContextOptions<
      T,
      WebsocketControllerOptions,
      WebsocketEvent<D>,
      WebSocketControllerHandlerOptions<D>
    >(target.constructor as Class<T>, methodName, options);
  };
}
