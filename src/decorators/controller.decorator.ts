import { Class } from 'utility-types';
import {
  ConstructorDecorator,
  setControllerContextOptions,
} from '@fireless/common';
import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from '../types';

export function Controller<D extends {}>(
  namespace: WebsocketControllerOptions['namespace'],
): ConstructorDecorator;
export function Controller<D extends {}>(
  options: WebsocketControllerOptions,
): ConstructorDecorator;
export function Controller<D extends {}>(
  namespaceOrOptions:
    | WebsocketControllerOptions
    | WebsocketControllerOptions['namespace'],
) {
  return <T extends {}>(Constructor: Class<T>): Class<T> => {
    const options: WebsocketControllerOptions =
      'object' === typeof namespaceOrOptions
        ? namespaceOrOptions
        : { namespace: namespaceOrOptions };

    setControllerContextOptions<
      T,
      WebsocketControllerOptions,
      WebsocketEvent<D>,
      WebSocketControllerHandlerOptions<D>
    >(Constructor, options);

    return Constructor;
  };
}
