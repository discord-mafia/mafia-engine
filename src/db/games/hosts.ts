import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { users } from '../users';
import { games } from './games';
import { eq } from 'drizzle-orm';
import { db } from '../../controllers/database';

export const gameHosts = pgTable('game_hosts', {
	id: serial('id').primaryKey(),
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

export type DbGameHost = typeof gameHosts.$inferSelect;
export type DbNewGameHost = typeof gameHosts.$inferInsert;

export class GameHost {
	private gameHost: DbGameHost;
	constructor(gameHost: DbGameHost) {
		this.gameHost = gameHost;
	}

	public getData() {
		return this.gameHost;
	}

	public async update(changes: Partial<DbGameHost>) {
		const res = await db
			.update(gameHosts)
			.set(changes)
			.where(eq(gameHosts.id, this.gameHost.id))
			.returning();
		const updated = res.shift();
		if (!updated) return null;
		this.gameHost = updated;
		return this;
	}

	static async fromId(id: number) {
		const res = await db
			.select()
			.from(gameHosts)
			.where(eq(gameHosts.id, id))
			.limit(1);
		const gameHost = res.shift();
		if (!gameHost) return null;
		return new GameHost(gameHost);
	}
}
