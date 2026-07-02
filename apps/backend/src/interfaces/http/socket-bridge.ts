import type { Server as HttpServer } from 'node:http';
import { setupSocketIo } from '../../lib/socket.js';

let socketBridge: ReturnType<typeof setupSocketIo> | undefined;

export function initializeSocketIo(server: HttpServer) {
  if (!socketBridge) {
    socketBridge = setupSocketIo(server);
  }
  return socketBridge;
}

export function getSocketIoBridge() {
  return socketBridge;
}
