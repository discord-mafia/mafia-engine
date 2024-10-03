import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { users } from '../users';
import { usergroups } from './usergroup';
import { db } from '../../controllers/database';
import { eq } from 'drizzle-orm';

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

export type DbParticipant = typeof participants.$inferSelect;
export type DbNewParticipant = typeof participants.$inferInsert;

export class Participant {
	private participant: DbParticipant;
	constructor(participant: DbParticipant) {
		this.participant = participant;
	}

	public getData() {
		return this.participant;
	}

	public getId() {
		return this.participant.id;
	}

	public getName() {
		return this.participant.name;
	}

	public getUserIds() {
		return this.participant.userIds;
	}

	public getMentorIds() {
		return this.participant.mentorIds;
	}

	public async update(changes: Partial<DbParticipant>) {
		const res = await db
			.update(participants)
			.set(changes)
			.where(eq(participants.id, this.participant.id))
			.returning();
		const updated = res.shift();
		if (!updated) return null;
		this.participant = updated;
		return this;
	}

	static async create(participant: DbNewParticipant) {
		const res = await db
			.insert(participants)
			.values(participant)
			.returning();
		const newParticipant = res.shift();
		if (!newParticipant) return null;
		return new Participant(newParticipant);
	}

	static async fromId(id: number) {
		const res = await db
			.select()
			.from(participants)
			.where(eq(participants.id, id))
			.limit(1);
		const participant = res.shift();
		if (!participant) return null;
		return new Participant(participant);
	}
}
