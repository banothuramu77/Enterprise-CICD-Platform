import 'dotenv/config';
import { createServer } from 'http';
import { loadEnv } from '@enterprise/shared';
import { createApp } from './interfaces/http/app.js';
import { initializeSocketIo } from './interfaces/http/socket-bridge.js';

const env = loadEnv();
const app = createApp();
const server = createServer(app);
initializeSocketIo(server);

server.listen(env.PORT, () => {
  console.log(`Backend listening on port ${env.PORT}`);
});
