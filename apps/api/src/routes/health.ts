import { Hono } from 'hono';
import type { AppBindings, AppVariables } from '../bindings';

const healthRoute = new Hono<{ Bindings: AppBindings; Variables: AppVariables }>();

healthRoute.get('/', (c) =>
  c.json({
    ok: true,
    timestamp: new Date().toISOString(),
  })
);

export default healthRoute;
