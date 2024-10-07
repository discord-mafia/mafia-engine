import {
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { and, eq } from 'drizzle-orm';

import { db } from '../../controllers/database';
import { Usergroup, usergroups } from './usergroup';
import { users } from '../users';

export const gameQueues = pgEnum('game_queue', [
	'newcomer',
	'main',
	'special',
	'community',
	'arcade',
	'unknown',
]);

export type GameQueueValue = (typeof gameQueues.enumValues)[number];

export function isValidGameQueue(value: string): value is GameQueueValue {
	return (gameQueues.enumValues as string[]).includes(value);
}

export const games = pgTable('games', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }).notNull(),
	queue: gameQueues('queue').notNull(),
	queueIndex: integer('queue_index').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gameHosts = pgTable('game_hosts', {
	gameId: integer('game_id')
		.notNull()
		.references(() => games.id, {
			onDelete: 'cascade',
		}),
	userId: varchar('user_id', { length: 32 })
		.notNull()
		.references(() => users.id, {
			onDelete: 'cascade',
		}),
});

export type DbGame = typeof games.$inferSelect;
export type DbNewGame = typeof games.$inferInsert;

export class Game {
	private game: DbGame;
	constructor(game: DbGame) {
		this.game = game;
	}

	public getData() {
		return this.game;
	}

	public async fetchUsergroups() {
		const res = await db
			.select()
			.from(usergroups)
			.where(eq(usergroups.gameId, this.game.id));

		const groups: Usergroup[] = [];
		for (const usergroup of res) {
			groups.push(new Usergroup(usergroup));
		}

		return groups;
	}

	public async update(changes: Partial<DbGame>) {
		const res = await db
			.update(games)
			.set(changes)
			.where(eq(games.id, this.game.id))
			.returning();
		const updated = res.shift();
		if (!updated) return null;
		this.game = updated;
		return this;
	}

	static async fromId(id: number) {
		const res = await db
			.select()
			.from(games)
			.where(eq(games.id, id))
			.limit(1);
		const game = res.shift();
		if (!game) return null;
		return new Game(game);
	}

	static async fromQueueIndex(queue: GameQueueValue, index: number) {
		const res = await db
			.select()
			.from(games)
			.where(and(eq(games.queue, queue), eq(games.queueIndex, index)))
			.limit(1);
		const game = res.shift();
		if (!game) return null;
		return new Game(game);
	}

	static async create(game: DbNewGame) {
		const res = await db.insert(games).values(game).returning();
		const newGame = res.shift();
		if (!newGame) return null;
		return new Game(newGame);
	}
}
