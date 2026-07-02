import { setupSocketIo } from '../../lib/socket.js';
let socketBridge;
export function initializeSocketIo(server) {
    if (!socketBridge) {
        socketBridge = setupSocketIo(server);
    }
    return socketBridge;
}
export function getSocketIoBridge() {
    return socketBridge;
}
//# sourceMappingURL=socket-bridge.js.map