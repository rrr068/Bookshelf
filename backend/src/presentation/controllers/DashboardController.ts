import { Context } from 'hono';
import { GetUserDashboardUseCase } from '../../application/usecases/GetUserDashboardUseCase';

export class DashboardController {
  constructor(
    private readonly getUserDashboardUseCase: GetUserDashboardUseCase
  ) {}

  async getDashboard(c: Context) {
    try {
      const userId = c.get('userId');
      const dashboard = await this.getUserDashboardUseCase.execute(userId);
      return c.json(dashboard, 200);
    } catch (error: any) {
      console.error('Dashboard error:', error.message);
      return c.json({ error: 'Failed to get dashboard' }, 500);
    }
  }
}
