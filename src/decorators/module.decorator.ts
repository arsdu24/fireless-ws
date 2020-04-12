import { Class } from 'utility-types';
import {
  ConstructorDecorator,
  setModuleContextControllers,
  setModuleContextOptions,
} from '@fireless/common';
import { WebSocketModule } from '../module';
import { ServerOptions } from 'ws';
import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from '../types';

type DecoratorOptions = {
  options: ServerOptions;
  controllers: Class<any>[];
};

export function Module(options: DecoratorOptions): ConstructorDecorator {
  return <T extends {}>(Target: Class<T>): Class<T> => {
    setModuleContextOptions<
      ServerOptions,
      WebsocketEvent<any>,
      WebsocketControllerOptions,
      WebSocketControllerHandlerOptions<any>
    >(Target, WebSocketModule, options.options);

    setModuleContextControllers<
      ServerOptions,
      WebsocketEvent<any>,
      WebsocketControllerOptions,
      WebSocketControllerHandlerOptions<any>
    >(Target, WebSocketModule, options.controllers);

    return Target;
  };
}
