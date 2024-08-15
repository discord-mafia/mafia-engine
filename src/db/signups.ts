import {
	boolean,
	integer,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const signups = pgTable('signups', {
	id: serial('id').primaryKey(),
	guild_id: varchar('guild_id', { length: 32 }).notNull(),
	channel_id: varchar('channel_id', { length: 32 }).notNull(),
	message_id: varchar('message_id', { length: 32 }).notNull(),
	name: varchar('name', { length: 256 }).notNull(),
	created_at: timestamp('created_at').notNull().defaultNow(),
	updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const signup_cateogies = pgTable('signup_categories', {
	id: serial('id').primaryKey(),
	signup_id: integer('signup_id')
		.notNull()
		.references(() => signups.id),
	name: varchar('name', { length: 256 }).notNull(),
	button_name: varchar('button_name', { length: 256 }),
	limit: integer('limit'),
	is_focused: boolean('is_focused'),
	is_hoisted: boolean('is_hoisted'),
	is_locked: boolean('is_locked'),
	created_at: timestamp('created_at').notNull().defaultNow(),
	updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const signup_user = pgTable('signup_user', {
	id: serial('id').primaryKey(),
	user_id: varchar('user_id', { length: 32 })
		.notNull()
		.references(() => users.id),
	category_id: integer('category_id')
		.notNull()
		.references(() => signup_cateogies.id),
	created_at: timestamp('created_at').notNull().defaultNow(),
});
