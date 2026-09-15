import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

/**
 * App is exported separately from the server bootstrap (server.ts).
 * This is essential for TDD: Supertest can import `app` directly and
 * fire requests at it in-memory, with no real port/network involved.
 */
export function createApp(): Application {
  const app = express();

  const clientUrl = process.env.CLIENT_URL;
  const allowedOrigins = clientUrl
    ? clientUrl.split(',').map((u) => u.trim().replace(/\/$/, ''))
    : '*';

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins === '*' || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS error: Origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
