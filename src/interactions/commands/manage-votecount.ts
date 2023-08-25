import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { prisma } from '../..';
import { getOrCreateUser, getPlayer, getVoteCounter } from '../../util/database';

const data = new SlashCommandBuilder().setName('manage-votecount').setDescription('Commands surrounding vote counts');
data.addSubcommand((sub) => sub.setName('create').setDescription('Create a new vote count'));
data.addSubcommand((sub) =>
	sub
		.setName('add')
		.setDescription('Add a player to the vote count')
		.addUserOption((option) => option.setName('player').setDescription('The player you are adding').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('remove')
		.setDescription('Remove a player from the vote count')
		.addUserOption((option) => option.setName('player').setDescription('The player you are removing').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('reset')
		.setDescription('Reset the vote count')
		.addIntegerOption((opt) => opt.setName('round').setDescription('The round you are resetting to').setRequired(true))
);

export default newSlashCommand({
	data,
	serverType: ServerType.MAIN,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'create':
				return createVoteCount(i);
			case 'add':
				return addPlayer(i);
			case 'remove':
				return removePlayer(i);
			case 'reset':
				return resetVoteCount(i);
			default:
				return i.reply({ content: `Unknown subcommand ${subcommand}`, ephemeral: true });
		}
	},
});

async function createVoteCount(i: ChatInputCommandInteraction) {
	if (!i.guild) return;

	await i.deferReply({ ephemeral: true });
	try {
		await prisma.voteCounter.create({
			data: {
				channelId: i.channelId,
			},
		});

		return await i.editReply({ content: `Vote Counter has been created, use other commands to add/remove players` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while creating the vote counter` });
	}
}

async function addPlayer(i: ChatInputCommandInteraction) {
	if (!i.guild) return;
	const user = i.options.getUser('player', true);
	const userDiscordId = user.id;

	await i.deferReply({ ephemeral: true });
	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		const member = await i.guild.members.fetch(userDiscordId);
		const user = await getOrCreateUser(member);
		if (!user) return i.editReply({ content: `Unable to fetch the user` });

		const player = await getPlayer(voteCounter.id, member.id);
		if (player) return i.editReply({ content: `This player is already in the vote count` });

		await prisma.player.create({
			data: {
				discordId: member.id,
				voteCounterId: voteCounter.id,
			},
		});

		return await i.editReply({ content: `Successfully added player to the vote count` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while creating the vote counter` });
	}
}

async function removePlayer(i: ChatInputCommandInteraction) {
	if (!i.guild) return;
	const user = i.options.getUser('player', true);
	const userDiscordId = user.id;

	await i.deferReply({ ephemeral: true });
	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		await prisma.player.delete({
			where: {
				voteCounterId_discordId: {
					voteCounterId: voteCounter.id,
					discordId: userDiscordId,
				},
			},
		});

		return await i.editReply({ content: `Successfully removed player from the vote count` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}

async function resetVoteCount(i: ChatInputCommandInteraction) {
	if (!i.guild) return;
	const round = i.options.getInteger('round', true);

	await i.deferReply({ ephemeral: true });
	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		await prisma.vote.deleteMany({
			where: {
				voteCounterId: voteCounter.id,
			},
		});

		await prisma.voteCounter.update({
			where: {
				id: voteCounter.id,
			},
			data: {
				currentRound: round,
				currentIteration: 0,
				lastCheckedVotes: new Date(),
			},
		});

		return await i.editReply({ content: `Successfully reset the vote count` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}
