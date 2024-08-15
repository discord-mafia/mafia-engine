import { eq } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { db } from '../controllers/database';

export const guilds = pgTable('guilds', {
	id: varchar('id', { length: 32 }).primaryKey(),
});

export type Guild = typeof guilds.$inferSelect;
export type NewGuild = typeof guilds.$inferInsert;

export async function getGuild(id: string): Promise<Guild | null> {
	const res = await db
		.select()
		.from(guilds)
		.where(eq(guilds.id, id))
		.limit(1);
	return res.shift() ?? null;
}

export async function getOrInsertGuild(
	new_guild: NewGuild
): Promise<Guild | null> {
	const guild = await getGuild(new_guild.id);
	if (guild) return guild;
	return await insertGuild(new_guild);
}

export async function insertGuild(new_guild: NewGuild): Promise<Guild | null> {
	const res = await db.insert(guilds).values(new_guild).returning();
	return res.shift() ?? null;
}
