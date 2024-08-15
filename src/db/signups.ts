import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { getUser, User, users } from './users';
import { eq } from 'drizzle-orm';
import { db } from '../controllers/database';

export const signups = pgTable(
	'signups',
	{
		id: serial('id').primaryKey(),
		name: varchar('name', { length: 256 }).notNull(),
		guildId: varchar('guild_id', { length: 32 }).notNull(),
		channelId: varchar('channel_id', { length: 32 }).notNull(),
		messageId: varchar('message_id', { length: 32 }).notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(t) => {
		return {
			messageIdx: index('message_id_idx').on(t.messageId),
		};
	}
);

export const signupCategories = pgTable(
	'signup_categories',
	{
		id: serial('id').primaryKey(),
		signupId: integer('signup_id')
			.notNull()
			.references(() => signups.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 256 }).notNull(),
		buttonName: varchar('button_name', { length: 256 }),
		limit: integer('limit'),
		isFocused: boolean('is_focused').notNull().default(false),
		isHoisted: boolean('is_hoisted').notNull().default(false),
		isLocked: boolean('is_locked').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(t) => {
		return {
			signupIdx: index('signup_id_idx').on(t.signupId),
		};
	}
);

export const signupUsers = pgTable(
	'signup_user',
	{
		id: serial('id').primaryKey(),
		signupId: integer('signup_id')
			.notNull()
			.references(() => signups.id, { onDelete: 'cascade' }),
		userId: varchar('user_id', { length: 32 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		categoryId: integer('category_id')
			.notNull()
			.references(() => signupCategories.id, { onDelete: 'cascade' }),
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
export type SignupCategory = typeof signupCategories.$inferSelect;
export type NewSignupCategory = typeof signupCategories.$inferInsert;
export type SignupUser = typeof signupUsers.$inferSelect;
export type NewSignupUser = typeof signupUsers.$inferInsert;

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

export async function insertSignupCategory(
	new_signup_category: NewSignupCategory
): Promise<SignupCategory | null> {
	const res = await db
		.insert(signupCategories)
		.values(new_signup_category)
		.returning();
	return res.shift() ?? null;
}

export type HydratedSignup = Signup & {
	categories: HydratedCategory[];
};

export type HydratedCategory = SignupCategory & {
	users: HydratedUser[];
};

export type HydratedUser = User & {
	username?: string;
};

export async function getHydratedSignup(
	messageId: string
): Promise<HydratedSignup | null> {
	const signup =
		(
			await db
				.select()
				.from(signups)
				.where(eq(signups.messageId, messageId))
				.limit(1)
		).shift() ?? null;

	if (!signup) return null;

	const categories = await db
		.select()
		.from(signupCategories)
		.where(eq(signupCategories.signupId, signup.id));

	const signup_users = await db
		.select()
		.from(signupUsers)
		.where(eq(signupUsers.signupId, signup.id));

	const true_categories: HydratedCategory[] = [];
	for (const category of categories) {
		const true_users: HydratedUser[] = [];
		for (const signup_user of signup_users) {
			const usr = await getUser(signup_user.userId);
			if (!usr) continue;
			true_users.push({ ...usr, username: usr.username });
		}

		const cat: HydratedCategory = {
			...category,
			users: true_users,
		};
		true_categories.push(cat);
	}

	return { ...signup, categories: true_categories };
}
