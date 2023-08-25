import { Request } from 'express';
import { publicProcedure } from '../trpc';

export const test = publicProcedure.query(({ ctx: { req } }) => {
	return {
		status: 'ok',
	};
});
