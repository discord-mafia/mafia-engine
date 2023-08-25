import { SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { prisma } from '../..';
import { getOrCreatePlayer, getPlayer, getVoteCounter } from '../../util/database';
import { calculateVoteCount, formatVoteCount } from '../../util/votecount';

const data = new SlashCommandBuilder().setName('vote').setDescription('Vote for a player');
data.addUserOption((option) => option.setName('player').setDescription('The player you are voting for').setRequired(false));
data.addStringOption((option) => option.setName('reason').setDescription('The reason you are voting for this player').setRequired(false));

data.addBooleanOption((option) => option.setName('unvote').setDescription('Remove your vote (overrides all other options)').setRequired(false));
data.addBooleanOption((option) =>
	option.setName('nolynch').setDescription('Vote for no-lynch (if true, overrides player option)').setRequired(false)
);

export default newSlashCommand({
	data,
	serverType: ServerType.MAIN,
	execute: async (i) => {
		if (!i.guild) return;
		const unvote = i.options.getBoolean('unvote', false) ?? false;
		const votedPlayerUser = unvote ? null : i.options.getUser('player', false);
		const reason = i.options.getString('reason', false);
		const noLynch = unvote ? false : i.options.getBoolean('no-lynch', false) ?? false;

		try {
			const voteCounter = await prisma.voteCounter.findUnique({ where: { channelId: i.channelId } });
			if (!voteCounter) return i.reply({ content: 'This is not a vote channel', ephemeral: true });

			const player = await getPlayer(voteCounter.id, i.user.id);
			if (!player) return i.reply({ content: 'Unable to fetch the player', ephemeral: true });

			let focusPlayerId: number | undefined;
			let focusPlayerDiscordId: string | undefined;

			if (unvote) {
			} else if (votedPlayerUser && !noLynch) {
				const votedMember = await i.guild.members.fetch(votedPlayerUser.id);
				if (!votedMember) return i.reply({ content: 'The player you are voting for is not in the server', ephemeral: true });
				const votingPlayer = await getOrCreatePlayer(voteCounter.id, votedPlayerUser.id);
				if (!votingPlayer) return i.reply({ content: 'Unable to fetch the player', ephemeral: true });

				focusPlayerId = votingPlayer.id;
				focusPlayerDiscordId = votingPlayer.discordId;
			} else if (!unvote && !noLynch && !(focusPlayerId && focusPlayerDiscordId))
				return i.reply({ content: 'You must specify a player to vote for or no lynch', ephemeral: true });

			const vote = await prisma.vote.create({
				data: {
					voteCounterId: voteCounter.id,
					voterId: player.id,
					votedTargetId: focusPlayerId,
					reason: reason || null,
					isNoLynch: noLynch,
				},
			});

			if (vote) {
				if (unvote) {
					await i.reply({
						content: `<@${i.user.id}> has removed their vote`,
						allowedMentions: {
							users: [],
						},
					});
				} else if (noLynch) {
					await i.reply({
						content: `<@${i.user.id}> has voted to no-lynch`,
						allowedMentions: {
							users: [],
						},
					});
				} else {
					await i.reply({
						content: `<@${i.user.id}> has voted for <@${focusPlayerDiscordId}>`,
						allowedMentions: {
							users: [],
						},
					});
				}

				const vc = await getVoteCounter({ channelId: i.channelId });
				if (vc) {
					const calculated = calculateVoteCount(vc);
					const voteAmount = await prisma.vote.count({ where: { voteCounterId: vc.id } });
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
			}
		} catch (err) {
			console.log(err);
			return i.reply({ content: 'An error occured while voting', ephemeral: true });
		}
	},
});
