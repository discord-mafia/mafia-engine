import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const app = express();
app.use(cors());

const t = initTRPC.context<any>().create({
	transformer: superjson,
	errorFormatter(opts) {
		return opts.shape;
	},
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

const appRouter = router({
	greeting: publicProcedure.input(z.string()).query((opts) => `Data has loaded from the server.`),
});

export type AppRouter = typeof appRouter;

app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
	})
);

export function runExpressServer(callback: () => any = () => {}) {
	app.listen(4000, () => {
		console.log('Listening on port 4000');
		callback();
	});
}
