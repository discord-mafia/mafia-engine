import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import express from 'express';
import cors from 'cors';
import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import superjson from 'superjson';
const app = express();
app.use(cors());

export const t = initTRPC.create({
	transformer: superjson,
	allowOutsideOfServer: true,
});

export const appRouter = t.router({
	getUser: t.procedure.input(z.string()).query((opts) => {
		return 'Loaded from server';
	}),
	createUser: t.procedure.input(z.object({ name: z.string().min(5) })).mutation(async (opts) => {
		return opts;
	}),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({}); // no context
// type Context = inferAsyncReturnType<typeof createContext>;

app.use(
	'/trpc',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
	})
);

export function runExpressServer(callback: () => any = () => {}) {
	app.listen(process.env.PORT ?? 4000, () => {
		console.log('Listening on port ' + process.env.PORT ?? '4000');
		callback();
	});
}
