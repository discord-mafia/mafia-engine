import { publicProcedure, router } from '@structures/trpc';
import { z } from 'zod';

export const appRouter = router({
	userList: publicProcedure.input(z.string()).query(async ({ input }) => {
		return input;
	}),
	test: publicProcedure.query(async () => {
		return {
			test: [1, 2, 3],
		};
	}),
});

export type AppRouter = typeof appRouter;
