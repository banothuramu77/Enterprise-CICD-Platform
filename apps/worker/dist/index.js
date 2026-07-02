import 'dotenv/config';
import { loadEnv } from '@enterprise/shared';
const env = loadEnv();
console.log(`Worker service ready with environment ${env.NODE_ENV}`);
console.log(`RabbitMQ target: ${env.RABBITMQ_URL}`);
//# sourceMappingURL=index.js.map