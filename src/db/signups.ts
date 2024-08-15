import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { eq } from 'drizzle-orm';
import { db } from '../controllers/database';

export const signups = pgTable(
	'signups',
	{
		id: serial('id').primaryKey(),
		guildId: varchar('guild_id', { length: 32 }).notNull(),
		channelId: varchar('channel_id', { length: 32 }).notNull(),
		messageId: varchar('message_id', { length: 32 }).notNull(),
		name: varchar('name', { length: 256 }).notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(t) => {
		return {
			messageIdx: index('message_id_idx').on(t.messageId),
		};
	}
);

export const signup_cateogies = pgTable(
	'signup_categories',
	{
		id: serial('id').primaryKey(),
		signupId: integer('signup_id')
			.notNull()
			.references(() => signups.id),
		name: varchar('name', { length: 256 }).notNull(),
		buttonName: varchar('button_name', { length: 256 }),
		limit: integer('limit'),
		isFocused: boolean('is_focused'),
		isHoisted: boolean('is_hoisted'),
		isLocked: boolean('is_locked'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(t) => {
		return {
			signupIdx: index('signup_id_idx').on(t.signupId),
		};
	}
);

export const signup_user = pgTable(
	'signup_user',
	{
		id: serial('id').primaryKey(),
		userId: varchar('user_id', { length: 32 })
			.notNull()
			.references(() => users.id),
		categoryId: integer('category_id')
			.notNull()
			.references(() => signup_cateogies.id),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(t) => {
		return {
			userIdx: index('user_id_idx').on(t.userId),
			categoryIdx: index('category_id_idx').on(t.categoryId),
		};
	}
);

export type Signup = typeof signups.$inferSelect;
export type NewSignup = typeof signups.$inferInsert;
export type SignupCategory = typeof signup_cateogies.$inferSelect;
export type NewSignupCategory = typeof signup_cateogies.$inferInsert;
export type SignupUser = typeof signup_user.$inferSelect;
export type NewSignupUser = typeof signup_user.$inferInsert;

export async function getSignup(id: number): Promise<Signup | null> {
	const res = await db
		.select()
		.from(signups)
		.where(eq(signups.id, id))
		.limit(1);
	return res.shift() ?? null;
}

export async function insertSignup(
	new_signup: NewSignup
): Promise<Signup | null> {
	const res = await db.insert(signups).values(new_signup).returning();
	return res.shift() ?? null;
}
