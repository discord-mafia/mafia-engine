import type { GuildMember, Snowflake } from 'discord.js';
import { prisma } from 'index';

export type User = NonNullable<Awaited<ReturnType<typeof getUserOrThrow>>>;
export async function getUserOrThrow(discordId: Snowflake) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				discordId,
			},
		});

		if (!user) throw new Error('Failed to get user');
		return user;
	} catch (err) {
		console.log(err);
		throw new Error('Failed to get user');
	}
}

export async function getUserById(discordId: Snowflake) {
	try {
		return await getUserOrThrow(discordId);
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function createUserOrThrow(member: GuildMember) {
	try {
		const user = await prisma.user.create({
			data: {
				discordId: member.id,
				username: member.displayName,
			},
		});
		if (!user) throw new Error('Failed to create user');
		return user;
	} catch (err) {
		console.log(err);
		throw new Error('Failed to create user');
	}
}

export async function createUser(member: GuildMember) {
	try {
		return await createUserOrThrow(member);
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function getOrCreateUser(member: GuildMember) {
	try {
		const user = await getUserById(member.id);
		if (user) return user;
		return await createUser(member);
	} catch (err) {
		console.log(err);
		return null;
	}
}
