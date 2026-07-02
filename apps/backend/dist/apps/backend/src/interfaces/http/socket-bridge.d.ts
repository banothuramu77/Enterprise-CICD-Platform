import type { Server as HttpServer } from 'node:http';
export declare function initializeSocketIo(server: HttpServer): {
    io: import("socket.io").Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    emitBuildEvent: (event: import("../../lib/socket.js").BuildSocketEvent) => void;
};
export declare function getSocketIoBridge(): {
    io: import("socket.io").Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    emitBuildEvent: (event: import("../../lib/socket.js").BuildSocketEvent) => void;
} | undefined;
