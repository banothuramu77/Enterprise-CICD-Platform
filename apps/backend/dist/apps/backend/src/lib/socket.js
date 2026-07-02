import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger.js';
export function setupSocketIo(server) {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
    });
    io.on('connection', (socket) => {
        logger.info(`Socket client connected: ${socket.id}`);
        socket.on('join:build', (buildId) => {
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
    const emitBuildEvent = (event) => {
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
//# sourceMappingURL=socket.js.map