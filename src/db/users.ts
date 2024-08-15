import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { db } from '../controllers/database';
import { eq } from 'drizzle-orm';

export const users = pgTable('users', {
	id: varchar('id', { length: 32 }).primaryKey(),
	username: varchar('username', { length: 32 }).notNull().unique(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export async function getUser(id: string): Promise<User | null> {
	const res = await db.select().from(users).where(eq(users.id, id)).limit(1);
	return res.shift() ?? null;
}

export async function getUserByName(name: string): Promise<User | null> {
	const res = await db
		.select()
		.from(users)
		.where(eq(users.username, name))
		.limit(1);
	return res.shift() ?? null;
}

export async function getOrInsertUser(new_user: NewUser): Promise<User | null> {
	const user = await getUser(new_user.id);
	if (user) return user;
	return await insertUser(new_user);
}

export async function insertUser(new_user: NewUser): Promise<User | null> {
	const res = await db.insert(users).values(new_user).returning();
	return res.shift() ?? null;
}
