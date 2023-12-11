import config from '@root/config';
import { type SQLWrapper } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(config.DATABASE_URL);
export const db = drizzle(queryClient);

export function rawQuery(query: SQLWrapper) {
	return db.execute(query);
}
