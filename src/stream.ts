import {
  WebSocketControllerHandlerOptions,
  WebsocketControllerOptions,
  WebsocketEvent,
} from './types';
import { filter } from 'rxjs/operators';
import { AbstractStream, AsyncResolver } from '@fireless/core';
import { overEvery, isMatchWith, matches } from 'lodash/fp';
import { Observable } from 'rxjs';

export class WebSocketStream extends AbstractStream<
  WebsocketEvent<any>,
  WebsocketControllerOptions,
  WebSocketControllerHandlerOptions<any>
> {
  constructor(observable: Observable<WebsocketEvent<any>>) {
    super(observable);
  }

  async pipe(options: WebsocketControllerOptions): Promise<WebSocketStream> {
    return new WebSocketStream(
      this.observable.pipe(
        this.namespacePipeFilter(options),
        this.typePipeFilter(options),
      ),
    );
  }

  namespacePipeFilter<T extends {}>(options: WebsocketControllerOptions) {
    return filter(
      (event: WebsocketEvent<T>) =>
        !(options.namespace && options.namespace !== event.namespace),
    );
  }

  typePipeFilter<T extends {}>(
    options: WebsocketControllerOptions | WebSocketControllerHandlerOptions<T>,
  ) {
    return filter(
      (event: WebsocketEvent<T>) =>
        !(options.type && options.type !== event.type),
    );
  }

  dataOverFilter<T extends {}>(options: WebSocketControllerHandlerOptions<T>) {
    return filter(
      (event: WebsocketEvent<T>) =>
        !(options.filters && !overEvery(options.filters)(event)),
    );
  }

  dataMatchFilter<T extends {}>(options: WebSocketControllerHandlerOptions<T>) {
    return filter((event: WebsocketEvent<T>) => {
      if (options.match) {
        const entityMatch: boolean = isMatchWith(
          (data, value) => {
            if ('function' === typeof value && !value(data)) {
              return false;
            }

            if (value instanceof RegExp && value.test(data)) {
              return false;
            }

            return !('object' === typeof value && !matches(data, value));
          },
          event.data,
          options.match,
        );

        if (!entityMatch) return false;
      }
      return true;
    });
  }

  async subscribe<T extends {}, R>(
    options: WebSocketControllerHandlerOptions<T>,
    handler: AsyncResolver<WebsocketEvent<T>, R>,
  ): Promise<void> {
    this.observable
      .pipe(
        this.typePipeFilter(options),
        this.dataMatchFilter(options),
        this.dataOverFilter(options),
      )
      .subscribe({
        next: async (event) => {
          try {
            const response: any = await handler(event);

            if (options.pipeResponse) {
              event.resolve(
                'object' === typeof response ? response : { response },
              );
            }
          } catch (e) {
            console.error(e);

            if (options.pipeResponse) {
              event.reject(e);
            }
          }
        },
      });
  }
}
