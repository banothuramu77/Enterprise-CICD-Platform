import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import healthRouter from './routes/health.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import repositoryRouter from './routes/repository.route.js';
import githubWebhookRouter from './routes/github-webhook.route.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupSwagger } from './swagger.js';
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(cookieParser());
    app.use(express.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }));
    app.use('/api/health', healthRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/users', userRouter);
    app.use('/api/repositories', repositoryRouter);
    app.use('/api/webhooks/github', githubWebhookRouter);
    setupSwagger(app);
    app.get('/', (_req, res) => {
        res.json({ message: 'Enterprise CI/CD Platform backend is running.' });
    });
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map