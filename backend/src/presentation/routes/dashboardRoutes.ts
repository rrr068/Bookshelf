import { Hono } from 'hono';
import { DashboardController } from '../controllers/DashboardController';
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { IJwtService } from '../../application/interfaces/IJwtService';

export const createDashboardRoutes = (
  controller: DashboardController,
  jwtService: IJwtService
) => {
  const app = new Hono();
  const authMiddleware = createAuthMiddleware(jwtService);

  app.get('/', authMiddleware, (c) => controller.getDashboard(c));

  return app;
};
