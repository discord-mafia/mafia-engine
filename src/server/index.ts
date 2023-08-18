import { publicProcedure, router } from './trpc';

const appRouter = router({
	userList: publicProcedure.query(async () => {
		const users: string[] = [];
		return users;
	}),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
