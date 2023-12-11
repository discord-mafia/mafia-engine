import { CustomError } from '@utils/errors';
import { prisma } from '..';

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

export type FullPlayer = NonNullable<Awaited<ReturnType<typeof getPlayer>>>;
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

export async function deletePlayerAndVotes(votecountId: number, discordId: string) {
	try {
		const deletedVotes = await prisma.vote.deleteMany({
			where: {
				voter: {
					discordId,
				},
				voteCounterId: votecountId,
			},
		});

		const deletedPlayer = await prisma.player.delete({
			where: {
				voteCounterId_discordId: {
					voteCounterId: votecountId,
					discordId,
				},
			},
		});

		return { deletedVotes, deletedPlayer };
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

export async function getVoteCounterOrThrow(query: VoteCountQuery) {
	const vc = await getVoteCounter(query);
	if (!vc) throw new CustomError('Vote counter not found');
	return vc;
}

export async function getVoteCounterPlayerOrThrow(vcId: number, discordId: string) {
	const player = await getPlayer(vcId, discordId);
	if (!player) throw new CustomError('Player not found in this votecount');
	return player;
}
