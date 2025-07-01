import { showRoutes } from 'hono/dev';
import { createApp } from 'honox/server';
import { apiRouter } from '@/app/api';

const app = createApp();

// Mount API routes
app.route('/api', apiRouter);

showRoutes(app);

export default app;