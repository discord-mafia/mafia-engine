import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '..';
export interface User {
	name: string | string[];
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
	const user: User = { name: req.headers['username'] ?? 'anonymous' };

	return { req, res, user, prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>;
