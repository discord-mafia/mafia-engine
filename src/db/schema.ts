import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: varchar('id', { length: 32 }).primaryKey(),
	username: varchar('username', { length: 32 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const guilds = pgTable('guilds', {
	id: varchar('id', { length: 32 }).primaryKey(),
});

export type Guild = typeof guilds.$inferSelect;
export type NewGuild = typeof guilds.$inferInsert;
