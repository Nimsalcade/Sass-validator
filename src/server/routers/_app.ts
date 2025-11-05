import { router } from '../trpc';
import { projectsRouter } from './projects';
import { researchRouter } from './research';
import { filesRouter } from './files';
import { experimentsRouter } from './experiments';
import { scoringRouter } from './scoring';
import { assetsRouter } from './assets';

export const appRouter = router({
  projects: projectsRouter,
  research: researchRouter,
  files: filesRouter,
  experiments: experimentsRouter,
  scoring: scoringRouter,
  assets: assetsRouter,
});

export type AppRouter = typeof appRouter;