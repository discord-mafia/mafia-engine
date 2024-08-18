import {
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const gameQueues = pgEnum('game_queue', [
	'newcomer',
	'main',
	'special',
	'community',
	'arcade',
	'unknown',
]);

export const participantType = pgEnum('participant_type', [
	'player',
	'spectator',
	'host',
	'unknown',
]);

export const games = pgTable('games', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }).notNull(),
	queue: gameQueues('queue').notNull(),
	queueIndex: integer('queue_index').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usergroups = pgTable('usergroups', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }).notNull(),
	type: participantType('type').notNull(),
	gameId: integer('game_id')
		.notNull()
		.references(() => games.id, {
			onDelete: 'cascade',
		}),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const participants = pgTable('participants', {
	id: serial('id').primaryKey(),
	usergroupId: integer('usergroup_id')
		.notNull()
		.references(() => usergroups.id, {
			onDelete: 'cascade',
		}),
	name: varchar('name', { length: 32 }),
	userIds: varchar('user_ids', { length: 32 })
		.array()
		.default([])
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
		}),

	mentorIds: varchar('mentor_ids', { length: 32 })
		.array()
		.default([])
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
		}),
});
