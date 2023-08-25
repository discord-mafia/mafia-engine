import { prisma } from '..';
import { type GuildMember, type Snowflake } from 'discord.js';

export type FullSignup = NonNullable<Awaited<ReturnType<typeof getSignup>>>;

type SignupQuery = {
	messageId?: string;
	signupId?: number;
};
export async function getSignup(query: SignupQuery) {
	try {
		const includeScript = {
			categories: {
				include: {
					users: {
						include: {
							user: true,
						},
					},
				},
			},
		};

		switch (true) {
			case query.messageId != null:
				return await prisma.signup.findUnique({ where: { messageId: query.messageId }, include: includeScript });
			case query.signupId != null:
				return await prisma.signup.findUnique({ where: { id: query.signupId }, include: includeScript });
			default:
				return null;
		}
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function getOrCreateUser(member: GuildMember) {
	try {
		const fetchedUser = await getUser(member.id);
		if (fetchedUser) return fetchedUser;

		return await prisma.user.create({
			data: {
				discordId: member.id,
				username: member.displayName,
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function getUser(discordId: string) {
	try {
		return await prisma.user.findUnique({
			where: {
				discordId,
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

type CitizenshipQuery =
	| {
			name: string;
	  }
	| {
			discordId: Snowflake;
	  };
export async function getCitizenship(query: CitizenshipQuery) {
	try {
		if ('name' in query) {
			const citizen = await prisma.user.findUnique({
				where: {
					username: query.name,
				},
			});
			return citizen;
		} else if ('discordId' in query) {
			const citizen = await prisma.user.findUnique({
				where: {
					discordId: query.discordId,
				},
			});
			return citizen;
		}
		return null;
	} catch (err) {
		return null;
	}
}

export async function getOrCreatePlayer(voteCountId: number, discordId: string) {
	try {
		const fetchedPlayer = await getPlayer(voteCountId, discordId);
		if (fetchedPlayer) return fetchedPlayer;

		return await prisma.player.create({
			data: {
				voteCounterId: voteCountId,
				discordId,
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function getPlayer(voteCountId: number, discordId: string) {
	try {
		return await prisma.player.findUnique({
			where: {
				voteCounterId_discordId: {
					discordId,
					voteCounterId: voteCountId,
				},
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

export type FullVoteCount = NonNullable<Awaited<ReturnType<typeof getVoteCounter>>>;
export type VoteCountQuery =
	| {
			channelId: string;
	  }
	| {
			id: number;
	  };
export async function getVoteCounter(query: VoteCountQuery) {
	return await prisma.voteCounter.findUnique({
		where: query,
		include: {
			players: {
				include: {
					user: true,
				},
			},
			votes: {
				include: {
					voter: true,
					votedTarget: true,
				},
			},
		},
	});
}

export type FullArchive = NonNullable<Awaited<ReturnType<typeof getArchive>>>;
export async function getArchive(gameTag: string) {
	try {
		return await prisma.archivedGame.findUnique({
			where: {
				gameHandle: gameTag,
			},
			include: {
				actions: {
					include: {
						user: {
							include: {
								user: true,
							},
						},
					},
				},
				urls: true,
				users: {
					include: {
						user: true,
					},
				},
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function createAutomatedGame(guildId: string) {
	try {
		return await prisma.automatedGame.create({
			data: {
				guildId,
			},
		});
	} catch (err) {
		console.log(err);
		return null;
	}
}

export type GameQuery =
	| {
			id: string;
	  }
	| {
			infoChannelId: string;
	  }
	| {
			voteCounterId: number;
	  };
export type FullAutomatedGame = NonNullable<Awaited<ReturnType<typeof getAutomatedGame>>>;

export async function getAutomatedGame(query: GameQuery) {
	try {
		const game = await prisma.automatedGame.findUnique({
			where: query,
			include: {
				confessionals: true,
				players: true,
				roles: true,
				voteCounter: true,
			},
		});
		return game;
	} catch (err) {
		return null;
	}
}

export async function getAutomatedGameOrThrow(query: GameQuery) {
	const game = await getAutomatedGame(query);
	if (!game) throw new Error('Game not found');
	return game;
}
