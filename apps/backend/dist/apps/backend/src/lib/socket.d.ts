import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
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
export declare function setupSocketIo(server: HttpServer): {
    io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    emitBuildEvent: (event: BuildSocketEvent) => void;
};
