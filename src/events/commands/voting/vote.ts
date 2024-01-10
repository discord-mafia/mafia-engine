import { prisma } from '../../..';
import { calculateVoteCount, formatVoteCount } from '@views/votecounter';
import { CustomError } from '../../../util/errors';
import { getVoteCounterOrThrow, getVoteCounterPlayerOrThrow, getPlayer, getVoteCounter } from '@models/votecounter';
import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('vote')
	.setDescription('[GAME] Vote for a player')
	.set((cmd) => {
		cmd.addUserOption((option) => option.setName('player').setDescription('The player you are voting for').setRequired(true));
	})
	.onExecute(async (i) => {
		if (!i.guild) return;
		const votedPlayerUser = i.options.getUser('player', true);

		try {
			const voteCount = await getVoteCounterOrThrow({ channelId: i.channelId });
			const player = await getVoteCounterPlayerOrThrow(voteCount.id, i.user.id);

			if (voteCount.lockVotes && voteCount.votes.reduce((acc, curr) => acc + (curr.voterId == player.id ? 1 : 0), 0) > 0) return i.reply({ content: 'You have already locked in your vote', ephemeral: true });

			const preCalculated = calculateVoteCount(voteCount);
			if (preCalculated.majorityReached) return i.reply({ content: 'Majority has already been reached', ephemeral: true });

			const votedMember = await i.guild.members.fetch(votedPlayerUser.id);
			if (!votedMember) return i.reply({ content: 'The player you are voting for is not in the server', ephemeral: true });
			const votingPlayer = await getPlayer(voteCount.id, votedPlayerUser.id);
			if (!votingPlayer) return i.reply({ content: 'You are not registered as a player for this votecount', ephemeral: true });

			const focusPlayerId = votingPlayer.id;
			const focusPlayerDiscordId = votingPlayer.discordId;

			const vote = await prisma.vote.create({
				data: {
					voteCounterId: voteCount.id,
					voterId: player.id,
					votedTargetId: focusPlayerId,
				},
			});

			if (!vote) return i.reply({ content: 'An error occurred while voting', ephemeral: true });
			await i.reply({
				content: `<@${i.user.id}> has voted for <@${focusPlayerDiscordId}>`,
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
