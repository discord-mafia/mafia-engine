import {
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

import { db } from '../../controllers/database';

export const gameQueues = pgEnum('game_queue', [
	'newcomer',
	'main',
	'special',
	'community',
	'arcade',
	'unknown',
]);

export const games = pgTable('games', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 256 }).notNull(),
	queue: gameQueues('queue').notNull(),
	queueIndex: integer('queue_index').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
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

	public getId() {
		return this.game.id;
	}

	public getName() {
		return this.game.name;
	}

	public getQueue() {
		return this.game.queue;
	}

	public getQueueIndex() {
		return this.game.queueIndex;
	}

	public getCreatedAt() {
		return this.game.createdAt;
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

	static async create(game: DbNewGame) {
		const res = await db.insert(games).values(game).returning();
		const newGame = res.shift();
		if (!newGame) return null;
		return new Game(newGame);
	}
}
