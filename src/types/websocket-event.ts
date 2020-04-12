export interface WebsocketEvent<D extends {}> {
  namespace: string | '_ws_' | '_unknown_';
  type: string | 'connected' | 'disconnected' | 'unknown';
  data: D;
  resolve: <T extends object>(data: T) => void;
  reject: <T extends Error>(error: T) => void;
}
