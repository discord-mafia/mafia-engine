import {
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { games } from './games';
import { eq } from 'drizzle-orm';
import { db } from '../../controllers/database';

export const participantType = pgEnum('participant_type', [
	'player',
	'spectator',
	'host',
	'unknown',
]);

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

type DbUsergroup = typeof usergroups.$inferSelect;
type DbNewUsergroup = typeof usergroups.$inferInsert;

export class Usergroup {
	private usergroup: DbUsergroup;
	constructor(usergroup: DbUsergroup) {
		this.usergroup = usergroup;
	}

	public getData() {
		return this.usergroup;
	}

	public async update(changes: Partial<DbUsergroup>) {
		const res = await db
			.update(usergroups)
			.set(changes)
			.where(eq(usergroups.id, this.usergroup.id))
			.returning();
		const updated = res.shift();
		if (!updated) return null;
		this.usergroup = updated;
		return this;
	}

	static async create(usergroup: DbNewUsergroup) {
		const res = await db.insert(usergroups).values(usergroup).returning();
		const newUsergroup = res.shift();
		if (!newUsergroup) return null;
		return new Usergroup(newUsergroup);
	}

	static async fromId(id: number) {
		const res = await db
			.select()
			.from(usergroups)
			.where(eq(usergroups.id, id))
			.limit(1);
		const usergroup = res.shift();
		if (!usergroup) return null;
		return new Usergroup(usergroup);
	}

	static async allFromGameId(gameId: number) {
		const res = await db
			.select()
			.from(usergroups)
			.where(eq(usergroups.gameId, gameId));

		const groups: Usergroup[] = [];
		for (const usergroup of res) {
			groups.push(new Usergroup(usergroup));
		}

		return groups;
	}
}
