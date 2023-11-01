import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { prisma } from '../..';
import { getOrCreateUser, getPlayer, getUser, getVoteCounter } from '../../util/database';

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
		.setName('add-from-role')
		.setDescription('Select a role to add those applicable players to the vote count')
		.addRoleOption((opt) => opt.setName('role').setDescription('The role you are adding').setRequired(true))
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

data.addSubcommand((sub) =>
	sub
		.setName('votes')
		.setDescription('Change the vote weight of a player')
		.addUserOption((opt) => opt.setName('player').setDescription('The player you are changing the vote weight of').setRequired(true))
		.addIntegerOption((opt) => opt.setName('weight').setDescription('The weight you are changing the vote to').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('replace')
		.setDescription('Replace a player in the vote count')
		.addUserOption((opt) => opt.setName('old').setDescription('The player you are replacing').setRequired(true))
		.addUserOption((opt) => opt.setName('new').setDescription('The player you are replacing with').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('no-lynch')
		.setDescription('Toggle whether or not players can vote for no-lynch')
		.addBooleanOption((bool) => bool.setName('enable').setDescription('Whether or not to enable no lynch').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('majority')
		.setDescription('Toggle whether or not majority is enabled')
		.addBooleanOption((bool) => bool.setName('enable').setDescription('Whether or not to enable majority').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('votes-locked')
		.setDescription('Toggle whether or not votes are locked when placed')
		.addBooleanOption((bool) => bool.setName('enable').setDescription('Whether or not to enable vote locking').setRequired(true))
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
			case 'votes':
				return changeVoteWeight(i);
			case 'replace':
				return replacePlayer(i);
			case 'no-lynch':
				return setNoLynch(i);
			case 'majority':
				return;
			case 'votes-locked':
				return setVotesLocked(i);
			case 'add-from-role':
				return addFromRole(i);
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

async function addFromRole(i: ChatInputCommandInteraction) {
	if (!i.guild) return;
	const role = i.options.getRole('role', true);

	await i.guild.roles.fetch();
	await i.guild.members.fetch();

	const trueRole = await i.guild.roles.fetch(role.id);
	if (!trueRole) return i.reply({ content: `Unable to fetch the role`, ephemeral: true });

	const members = trueRole.members.map((x) => x);
	if (members.length == 0) return i.reply({ content: `No members in the role`, ephemeral: true });

	await i.deferReply({ ephemeral: true });
	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		const beginningCount = await prisma.player.count({
			where: {
				voteCounterId: voteCounter.id,
			},
		});

		for (const member of members) {
			const user = await getOrCreateUser(member);
			if (!user) return i.editReply({ content: `Unable to fetch the user` });

			const player = await getPlayer(voteCounter.id, member.id);
			if (player) continue;

			await prisma.player.create({
				data: {
					discordId: member.id,
					voteCounterId: voteCounter.id,
				},
			});
		}

		const playerCount = await prisma.player.count({
			where: {
				voteCounterId: voteCounter.id,
			},
		});

		return await i.editReply({ content: `Successfully added ${playerCount - beginningCount} players to the vote count` });
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

async function changeVoteWeight(i: ChatInputCommandInteraction) {
	const user = i.options.getUser('player', true);
	const weight = i.options.getInteger('weight', true);

	await i.deferReply({ ephemeral: true });

	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		const player = await getPlayer(voteCounter.id, user.id);
		if (!player) return i.editReply({ content: `This player is not in the vote count` });

		await prisma.player.update({
			where: {
				voteCounterId_discordId: {
					voteCounterId: voteCounter.id,
					discordId: user.id,
				},
			},
			data: {
				voteWeight: weight,
			},
		});

		return await i.editReply({ content: `Successfully changed the vote weight of the player` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}

async function replacePlayer(i: ChatInputCommandInteraction) {
	const oldPlayer = i.options.getUser('old', true);
	const newPlayer = i.options.getUser('new', true);

	await i.deferReply({ ephemeral: true });

	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		const player = await getPlayer(voteCounter.id, oldPlayer.id);
		if (!player) return i.editReply({ content: `The old player is not in the vote count` });

		const user = await getUser(newPlayer.id);
		if (!user) return i.editReply({ content: `The new player is not in the database` });

		await prisma.player.update({
			where: {
				voteCounterId_discordId: {
					voteCounterId: voteCounter.id,
					discordId: oldPlayer.id,
				},
			},
			data: {
				discordId: newPlayer.id,
			},
		});

		return await i.editReply({ content: `Successfully changed the player in the vote count` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}

async function setNoLynch(i: ChatInputCommandInteraction) {
	const enable = i.options.getBoolean('enable', true);

	await i.deferReply({ ephemeral: true });

	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		await prisma.voteCounter.update({
			where: {
				id: voteCounter.id,
			},
			data: {
				noLynch: enable,
			},
		});

		return await i.editReply({ content: `Successfully changed the no-lynch setting` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}

async function setVotesLocked(i: ChatInputCommandInteraction) {
	const enable = i.options.getBoolean('enable', true);

	await i.deferReply({ ephemeral: true });

	try {
		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.editReply({ content: `This is not a vote channel` });

		await prisma.voteCounter.update({
			where: {
				id: voteCounter.id,
			},
			data: {
				lockVotes: enable,
			},
		});

		return await i.editReply({ content: `Successfully changed the votes locked setting` });
	} catch (err) {
		console.log(err);
		return i.editReply({ content: `An error occured while removing player from the vote counter` });
	}
}
