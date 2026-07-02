import 'dotenv/config';
import { loadEnv } from '@enterprise/shared';
import { startBuildConsumer } from './build-consumer.js';
import { monitorBuildQueue } from './build-queue-monitor.js';
const env = loadEnv();
console.log(`Worker service ready with environment ${env.NODE_ENV}`);
console.log(`RabbitMQ target: ${env.RABBITMQ_URL}`);
const worker = await startBuildConsumer();
const monitor = await monitorBuildQueue(worker.workerId);
console.log(`Worker ${worker.workerId} registered and monitoring enabled`, monitor);
//# sourceMappingURL=index.js.map