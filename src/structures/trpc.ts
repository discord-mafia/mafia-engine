import { initTRPC } from '@trpc/server';
import type * as trpcExpress from '@trpc/server/adapters/express';
const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const createContext = (_ctx: trpcExpress.CreateExpressContextOptions) => ({}); // no context
export type Context = Awaited<ReturnType<typeof createContext>>;
