import { Hono } from 'hono';
import type { AppBindings, AppVariables } from './bindings';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import healthRoute from './routes/health';

const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

app.use('*', async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
});
app.use('*', errorHandler);
app.use('*', corsMiddleware);

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'clipart-api',
  })
);

app.route('/health', healthRoute);

export default app;
