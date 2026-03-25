import { Hono } from 'hono';
import type { AppBindings, AppVariables } from './bindings';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { generateRateLimitMiddleware, uploadRateLimitMiddleware } from './middleware/rate-limit';
import generateRoute from './routes/generate';
import healthRoute from './routes/health';
import jobRoute from './routes/job';
import uploadRoute from './routes/upload';
import webhookRoute from './routes/webhook';

const app = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

app.use('*', async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
});
app.use('*', errorHandler);
app.use('*', corsMiddleware);
app.use('/upload', uploadRateLimitMiddleware);
app.use('/generate', generateRateLimitMiddleware);

app.get('/', (c) =>
  c.json({
    ok: true,
    service: 'clipart-api',
  })
);

app.route('/health', healthRoute);
app.route('/upload', uploadRoute);
app.route('/generate', generateRoute);
app.route('/job', jobRoute);
app.route('/webhook', webhookRoute);

export default app;
