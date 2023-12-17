import { prisma } from '../../..';
import { calculateVoteCount, formatVoteCount } from '../../../util/votecount';
import { CustomError } from '../../../util/errors';
import { getVoteCounterOrThrow, getVoteCounterPlayerOrThrow, getVoteCounter } from '@models/votecounter';
import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('unvote').setDescription('[GAME] Remove your vote').onExecute(async (i) => {
	if (!i.guild) return;

	try {
		const voteCounter = await getVoteCounterOrThrow({ channelId: i.channelId });
		const player = await getVoteCounterPlayerOrThrow(voteCounter.id, i.user.id);

		if (voteCounter.lockVotes && voteCounter.votes.reduce((acc, curr) => acc + (curr.voterId == player.id ? 1 : 0), 0) > 0)
			return i.reply({ content: 'You have already locked in your vote', ephemeral: true });

		const preCalculated = calculateVoteCount(voteCounter);
		if (preCalculated.majorityReached) return i.reply({ content: 'Majority has already been reached', ephemeral: true });

		const vote = await prisma.vote.create({
			data: {
				voteCounterId: voteCounter.id,
				voterId: player.id,
				votedTargetId: undefined,
				isNoLynch: undefined,
			},
		});

		if (!vote) return i.reply({ content: 'An error occurred while unvoting', ephemeral: true });

		await i.reply({
			content: `<@${i.user.id}> has removed their vote`,
			allowedMentions: {
				users: [],
			},
			ephemeral: false,
		});

		const vc = await getVoteCounter({ channelId: i.channelId });
		if (vc) {
			const calculated = calculateVoteCount(vc);
			const voteAmount = vc.votes.length;
			const isInterval = voteAmount % 5;
			if (calculated.majorityReached || isInterval == 0) {
				const format = formatVoteCount(calculated);
				const response = await i.followUp({ content: format });
				if (response) {
					await prisma.voteCounter.update({
						where: {
							id: vc.id,
						},
						data: {
							currentIteration: vc.currentIteration + 1,
						},
					});
				}
			}
		}
	} catch (err) {
		if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
		else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
		else console.log(err);
	}
});
