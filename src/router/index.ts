import config from '../config';
import { auth } from './routes/auth';
import { test } from './routes/test';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
	clerkPublishable: publicProcedure.query(() => {
		return config.VITE_REACT_APP_CLERK_PUBLISHABLE_KEY;
	}),
	healthCheck: test,
	auth: auth,
});

export type AppRouter = typeof appRouter;
