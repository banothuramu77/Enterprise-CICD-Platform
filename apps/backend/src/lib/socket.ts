import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger.js';

export interface BuildSocketEvent {
  type: 'build:log' | 'build:progress' | 'build:status' | 'worker:status';
  buildId?: string;
  workerId?: string;
  message?: string;
  progress?: number;
  status?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export function setupSocketIo(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('join:build', (buildId: string) => {
      socket.join(`build:${buildId}`);
      logger.info(`Socket ${socket.id} joined build ${buildId}`);
    });

    socket.on('join:workers', () => {
      socket.join('workers');
      logger.info(`Socket ${socket.id} joined worker updates`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  const emitBuildEvent = (event: BuildSocketEvent) => {
    if (event.buildId) {
      io.to(`build:${event.buildId}`).emit('build:event', event);
    }
    if (event.type === 'worker:status') {
      io.to('workers').emit('worker:event', event);
    }
  };

  return {
    io,
    emitBuildEvent,
  };
}
