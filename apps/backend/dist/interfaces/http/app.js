import cors from 'cors';
import express from 'express';
import healthRouter from './routes/health.route.js';
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/health', healthRouter);
    app.get('/', (_req, res) => {
        res.json({ message: 'Enterprise CI/CD Platform backend is running.' });
    });
    return app;
}
//# sourceMappingURL=app.js.map