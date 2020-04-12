import {
  asyncResolverFromTransformPipes,
  createPipedHandlerParamDecorator,
  createTransformPipe,
  PipedDecorator,
  PipedHandlerParamDecoratorCreatorOptions,
  setControllerHandlerContextParamResolver,
  TransformPipe,
} from '@fireless/common';
import { Class } from 'utility-types';
import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from '../types';

function registerParamResolver<D extends {}>(
  pipes: Class<TransformPipe<any, any>>[],
) {
  return <T extends {}>(
    target: T,
    methodName: keyof T,
    index: number,
  ): void => {
    setControllerHandlerContextParamResolver<
      T,
      WebsocketControllerOptions,
      WebsocketEvent<D>,
      WebSocketControllerHandlerOptions<D>
    >(
      target.constructor as Class<T>,
      methodName,
      index,
      asyncResolverFromTransformPipes(...pipes),
    );
  };
}

export function Event<D extends {}>() {
  return {
    Namespace: (...pipes: Class<TransformPipe<any, any>>[]) =>
      registerParamResolver<string>([
        createTransformPipe(
          async (event: WebsocketEvent<D>) => event.namespace,
        ),
        ...pipes,
      ]) as PipedDecorator<string>,
    Type: (...pipes: Class<TransformPipe<any, any>>[]) =>
      registerParamResolver<string>([
        createTransformPipe(async (event: WebsocketEvent<D>) => event.type),
        ...pipes,
      ]) as PipedDecorator<string>,
    Data: createPipedHandlerParamDecorator<D>(
      (options: PipedHandlerParamDecoratorCreatorOptions<D>) => {
        return registerParamResolver<D>([
          createTransformPipe(async (event: WebsocketEvent<D>) =>
            options.key ? event.data[options.key] : event.data,
          ),
          ...options.pipes,
        ]);
      },
    ),
    Method: {
      Resolve: (...pipes: Class<TransformPipe<any, any>>[]) =>
        registerParamResolver<Function>([
          createTransformPipe(
            async (event: WebsocketEvent<D>) => event.resolve,
          ),
          ...pipes,
        ]) as PipedDecorator<Function>,
      Reject: (...pipes: Class<TransformPipe<any, any>>[]) =>
        registerParamResolver<string>([
          createTransformPipe(async (event: WebsocketEvent<D>) => event.type),
          ...pipes,
        ]) as PipedDecorator<string>,
    },
  };
}
