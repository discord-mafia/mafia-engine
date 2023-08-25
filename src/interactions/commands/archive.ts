import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	type SlashCommandStringOption,
} from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import { prisma } from '../..';
import { type FullArchive, getArchive, getUser } from '../../util/database';
import { createViewArchiveButton } from '../buttons/archiveManageMembers';
import viewArchiveMentions from '../buttons/viewArchiveMentions';
import refreshArchive from '../buttons/refreshArchive';

const data = new SlashCommandBuilder().setName('archive').setDescription('Manage an archive');

export const queues: string[] = ['main', 'special', 'newcomer', 'turbo', 'community', 'extra'];
const phases: string[] = ['day', 'night', 'pregame', 'postgame'];

export function addQueueOptions(opt: SlashCommandStringOption) {
	return opt
		.setName('queue')
		.setDescription('The queue to start an archive for')
		.setChoices(
			...queues.map((queue) => {
				return { name: queue.charAt(0).toUpperCase() + queue.slice(1), value: queue };
			})
		)
		.setRequired(true);
}

data.addSubcommand((sub) =>
	sub
		.setName('start')
		.setDescription('Start an archive')
		.addStringOption((opt) =>
			opt
				.setName('queue')
				.setDescription('The queue to start an archive for')
				.setChoices(
					...queues.map((queue) => {
						return { name: queue.charAt(0).toUpperCase() + queue.slice(1), value: queue };
					})
				)
				.setRequired(true)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) => opt.setName('title').setDescription('The title of the game').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('view')
		.setDescription('View an archive')
		.addStringOption((opt) =>
			opt
				.setName('queue')
				.setDescription('The queue to start an archive for')
				.setChoices(
					...queues.map((queue) => {
						return { name: queue.charAt(0).toUpperCase() + queue.slice(1), value: queue };
					})
				)
				.setRequired(true)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('host')
		.setDescription('Add a host to an archive')
		.addStringOption((opt) =>
			opt
				.setName('queue')
				.setDescription('The queue to start an archive for')
				.setChoices(
					...queues.map((queue) => {
						return { name: queue.charAt(0).toUpperCase() + queue.slice(1), value: queue };
					})
				)
				.setRequired(true)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addUserOption((opt) => opt.setName('member').setDescription('The member to add').setRequired(false))
		.addStringOption((opt) => opt.setName('discordid').setDescription('The host discord ID').setRequired(false))
		.addStringOption((opt) => opt.setName('username').setDescription('The username of the host').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('cohost')
		.setDescription('Add a cohost to an archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addUserOption((opt) => opt.setName('member').setDescription('The member to add').setRequired(false))
		.addStringOption((opt) => opt.setName('discordid').setDescription('The host discord ID').setRequired(false))
		.addStringOption((opt) => opt.setName('username').setDescription('The username of the host').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('player')
		.setDescription('Add a player to an archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) => opt.setName('alignment').setDescription('The alignment of the member').setRequired(true))
		.addStringOption((opt) => opt.setName('role').setDescription('The role of the member').setRequired(true))
		.addBooleanOption((opt) => opt.setName('won').setDescription('Whether the member won the game').setRequired(true))
		.addUserOption((opt) => opt.setName('member').setDescription('The member to add').setRequired(false))
		.addStringOption((opt) => opt.setName('discordid').setDescription('The host discord ID').setRequired(false))
		.addStringOption((opt) => opt.setName('username').setDescription('The username of the host').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('spreadsheet')
		.setDescription('Set the spreadsheet URL')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) => opt.setName('url').setDescription('The URL of the spreadsheet').setRequired(false))
		.addStringOption((opt) => opt.setName('imageurl').setDescription('The image').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('url')
		.setDescription('Add a URL to an archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) => opt.setName('url').setDescription('The URL to add').setRequired(true))
		.addStringOption((opt) => opt.setName('description').setDescription('The description of the URL').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('event')
		.setDescription('Add an event to an archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) =>
			opt
				.setName('phase')
				.setDescription('The phase of the event')
				.setRequired(true)
				.addChoices(...phases.map((phase) => ({ name: phase, value: phase })))
		)
		.addIntegerOption((opt) => opt.setName('eventnumber').setDescription('The day of the event').setRequired(true))
		.addStringOption((opt) => opt.setName('event').setDescription('The event to add').setRequired(true))
		.addUserOption((opt) => opt.setName('member').setDescription('The member to add').setRequired(false))
		.addStringOption((opt) => opt.setName('discordid').setDescription('The host discord ID').setRequired(false))
		.addStringOption((opt) => opt.setName('username').setDescription('The username of the host').setRequired(false))
);
data.addSubcommand((sub) =>
	sub
		.setName('submit')
		.setDescription('Submit the archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addChannelOption((opt) =>
			opt.setName('channel').setDescription('The channel to submit the archive to').setRequired(true).addChannelTypes(ChannelType.GuildForum)
		)
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'start':
				return startArchive(i);
			case 'view':
				return viewArchive(i);
			case 'host':
				return addHost(i);
			case 'cohost':
				return addCoHost(i);
			case 'player':
				return addWinner(i);
			case 'spreadsheet':
				return setSpreadsheet(i);
			case 'url':
				return addUrl(i);
			case 'event':
				return addEvent(i);
			case 'submit':
				return runSubmit(i);
			default:
				return i.reply({ content: 'Not implemented yet.' });
		}
	},
});

async function runSubmit(i: ChatInputCommandInteraction) {
	if (!i.guild) return i.reply({ content: 'This command can only be used in a server.', ephemeral: true });
	const channel = i.options.getChannel('channel', true);
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const tag = getGameTag(queue, number);

	await i.deferReply();
	try {
		const forumChannel = await i.guild.channels.fetch(channel.id);
		if (!forumChannel || forumChannel.type != ChannelType.GuildForum) return i.editReply({ content: 'Invalid channel.' });

		const archive = await getArchive(tag);
		if (!archive) return i.editReply({ content: `No archive found for ${tag}.` });

		const formattedArchive = formatArchive(archive);
		const { content, image } = formattedArchive;
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(viewArchiveMentions.createCustomID(tag)).setLabel('View Mentions').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(refreshArchive.createCustomID(tag)).setLabel('Refresh').setStyle(ButtonStyle.Secondary)
		);

		const message = await forumChannel.threads.create({
			name: `${tag} - ${archive.gameTitle}`,
			message: {
				content,
				files: image
					? [
							{
								attachment: image,
								name: 'archive.png',
							},
					  ]
					: undefined,
				components: [row],
			},
		});

		await i.editReply({ content: `Submitted archive to ${message.url}\n**Make sure to manually add the appropriate tags**` });
	} catch (err) {
		console.error(err);
		await i.editReply({ content: 'An error occured.' });
	}
}

export function getGameTag(queue: string, number: number) {
	return queue.slice(0, 2).toUpperCase() + number;
}

async function viewArchive(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const tag = getGameTag(queue, number);

	const archive = await getArchive(tag);
	if (!archive) return i.reply({ content: `No archive found for ${tag}.` });

	const { content, image } = formatArchive(archive);
	return i.reply({
		content,
		ephemeral: true,
		files: image
			? [
					{
						attachment: image,
						name: 'archive.png',
					},
			  ]
			: undefined,
	});
}

async function startArchive(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const title = i.options.getString('title', true);

	const gameTag = getGameTag(queue, number);

	await prisma.archivedGame.create({
		data: {
			gameHandle: gameTag,
			gameTitle: title,
		},
	});

	const row = createViewArchiveButton(gameTag);

	await i.reply({ content: `Successfully started archive for ${gameTag}.`, components: [row] });
}

async function addHost(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const hostNumber = i.options.getString('discordid', false);
	const member = i.options.getUser('member', false);
	const gameTag = getGameTag(queue, number);

	const discordID = member?.id || hostNumber?.toString();
	if (!discordID) return i.reply({ content: 'No member or discord id provided.', ephemeral: true });

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });

	const user = await getUser(discordID);
	if (!user) return i.reply({ content: 'User not found and could not be created with the supplied props', ephemeral: true });

	const userJunction = await prisma.archivedGameUserJunction.create({
		data: {
			userId: user.id,
			isHost: true,
			archivedGameId: archivedGame.id,
		},
	});

	if (!userJunction) return i.reply({ content: 'Failed to add host to archive', ephemeral: true });

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully added host to archive for ${gameTag}.`, components: [row] });
}

async function addCoHost(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const hostNumber = i.options.getString('discordid', false);
	const username = i.options.getString('username', false);
	const member = i.options.getUser('member', false);
	const gameTag = getGameTag(queue, number);

	const isUsingDiscordID = !member && hostNumber;
	const discordID = member?.id || hostNumber?.toString();
	if (!discordID) return i.reply({ content: 'No member or discord id provided.', ephemeral: true });

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });

	const fetchedUser = await getUser(discordID);
	if (!fetchedUser) {
		if (isUsingDiscordID) {
			if (!username)
				return i.reply({
					content: 'User not found, and creating a new user requires a `username` prop that was not supplied.',
					ephemeral: true,
				});

			await prisma.user.create({
				data: {
					discordId: discordID,
					username: username,
				},
			});
		} else {
			const member = await i.guild?.members.fetch(discordID);
			if (!member) return i.reply({ content: 'User not found. Try again using the Discord ID and username instead', ephemeral: true });

			await prisma.user.create({
				data: {
					discordId: discordID,
					username: member.user.username,
				},
			});
		}
	}

	const user = await getUser(discordID);
	if (!user) return i.reply({ content: 'User not found and could not be created with the supplied props', ephemeral: true });

	const userJunction = await prisma.archivedGameUserJunction.create({
		data: {
			userId: user.id,
			isCoHost: true,
			archivedGameId: archivedGame.id,
		},
	});

	if (!userJunction) return i.reply({ content: 'Failed to add host to archive', ephemeral: true });

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully added host to archive for ${gameTag}.`, components: [row] });
}

async function addWinner(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const hostNumber = i.options.getString('discordid', false);
	const username = i.options.getString('username', false);
	const member = i.options.getUser('member', false);
	const alignment = i.options.getString('alignment', true);
	const role = i.options.getString('role', true);
	const hasWon = i.options.getBoolean('won', true);

	const gameTag = getGameTag(queue, number);

	const isUsingDiscordID = !member && hostNumber;
	const discordID = member?.id || hostNumber?.toString();
	if (!discordID) return i.reply({ content: 'No member or discord id provided.', ephemeral: true });

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });

	const fetchedUser = await getUser(discordID);
	if (!fetchedUser) {
		if (isUsingDiscordID) {
			if (!username)
				return i.reply({
					content: 'User not found, and creating a new user requires a `username` prop that was not supplied.',
					ephemeral: true,
				});

			await prisma.user.create({
				data: {
					discordId: discordID,
					username: username,
				},
			});
		} else {
			const member = await i.guild?.members.fetch(discordID);
			if (!member) return i.reply({ content: 'User not found. Try again using the Discord ID and username instead', ephemeral: true });

			await prisma.user.create({
				data: {
					discordId: discordID,
					username: member.user.username,
				},
			});
		}
	}

	const user = await getUser(discordID);
	if (!user) return i.reply({ content: 'User not found and could not be created with the supplied props', ephemeral: true });

	const userJunction = await prisma.archivedGameUserJunction.create({
		data: {
			userId: user.id,
			isWinner: hasWon,
			isLoser: !hasWon,
			role: role,
			alignment: alignment,
			archivedGameId: archivedGame.id,
		},
	});

	if (!userJunction) return i.reply({ content: 'Failed to add host to archive', ephemeral: true });

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully added player to archive for ${gameTag}.`, components: [row] });
}

async function setSpreadsheet(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const spreadsheet = i.options.getString('url', false);
	const image = i.options.getString('imageurl', false);

	if (!spreadsheet && !image) return i.reply({ content: 'No spreadsheet or image provided.', ephemeral: true });

	const gameTag = getGameTag(queue, number);

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });

	await prisma.archivedGame.update({
		where: {
			id: archivedGame.id,
		},
		data: {
			spreadsheetURL: spreadsheet,
			spreadsheetImageURL: image,
		},
	});

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully updated spreadsheet for ${gameTag}.`, components: [row] });
}

async function addUrl(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const url = i.options.getString('url', true);
	const description = i.options.getString('description', false);

	const gameTag = getGameTag(queue, number);

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });

	await prisma.archivedURL.create({
		data: {
			archivedGameId: archivedGame.id,
			url: url,
			name: description,
		},
	});

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully added url to archive for ${gameTag}.`, components: [row] });
}

async function addEvent(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const event = i.options.getString('event', true);
	const phase = i.options.getString('phase', true);
	const hostNumber = i.options.getString('discordid', false);
	const eventNumber = i.options.getInteger('eventnumber', true);
	const member = i.options.getUser('member', false);

	const gameTag = getGameTag(queue, number);

	const discordID = member?.id || hostNumber?.toString();
	const hasUser = !!discordID;

	const archivedGame = await getArchive(gameTag);
	if (!archivedGame) return i.reply({ content: `No archive found for ${gameTag}.`, ephemeral: true });
	const fetchedUser = await prisma.archivedGameUserJunction.findFirst({
		where: {
			archivedGameId: archivedGame.id,
			user: {
				discordId: discordID,
			},
		},
	});

	const archivedGameEvent = await prisma.archivedGameAction.create({
		data: {
			archivedGameId: archivedGame.id,
			userId: hasUser ? fetchedUser?.id : undefined,
			actionDetails: event,
			phase: phase,
			phaseNumber: eventNumber,
		},
	});

	if (!archivedGameEvent) return i.reply({ content: 'Failed to add event to archive', ephemeral: true });

	const row = createViewArchiveButton(gameTag);
	return i.reply({ content: `Successfully added event to archive for ${gameTag}.`, components: [row] });
}

export function formatArchive(archive: FullArchive) {
	let format = `# ${archive.gameHandle.toUpperCase()}: ${archive.gameTitle}\n`;

	const hostList = archive.users
		.filter((user) => user.isHost)
		.map((user) => `- ${user.user.username}`)
		.join('\n');
	if (hostList.length > 0) format += `## Hosts\n${hostList}\n`;

	const coHostList = archive.users
		.filter((user) => user.isCoHost)
		.map((user) => `- ${user.user.username}`)
		.join('\n');
	if (coHostList.length > 0) format += `## Co-Hosts\n${coHostList}\n`;

	const winnerListFormat = new Map<string, string[]>();
	archive.users
		.filter((user) => user.isWinner)
		.forEach((v) => {
			if (v.role && v.alignment) {
				if (!winnerListFormat.get(v.alignment)) winnerListFormat.set(v.alignment, []);
				winnerListFormat.get(v.alignment)?.push(` - **${v.user.username}** as ${v.role}`);
			}
		});
	if (winnerListFormat.size > 0) {
		format += `## Winners\n`;
		winnerListFormat.forEach((v, k) => {
			format += `- **${k}**\n`;
			format += `${v.join('\n')}\n`;
		});
	}

	const loserListFormat = new Map<string, string[]>();
	archive.users
		.filter((user) => user.isLoser)
		.forEach((v) => {
			if (v.role && v.alignment) {
				if (!loserListFormat.get(v.alignment)) loserListFormat.set(v.alignment, []);
				loserListFormat.get(v.alignment)?.push(` - **${v.user.username}** as ${v.role}`);
			}
		});
	if (loserListFormat.size > 0) {
		format += `## Losers\n`;
		loserListFormat.forEach((v, k) => {
			format += `- **${k}**\n`;
			format += `${v.join('\n')}\n`;
		});
	}

	if (archive.actions.length > 0) {
		format += `## Game History\n`;

		const preGame = archive.actions.filter((action) => action.phase === 'pregame');
		const postGame = archive.actions.filter((action) => action.phase === 'postgame');

		const dayActions = new Map<number, string[]>();
		const nightActions = new Map<number, string[]>();

		let largestPhaseNumber = 0;

		archive.actions
			.filter((action) => action.phase === 'day')
			.forEach((action) => {
				largestPhaseNumber = Math.max(largestPhaseNumber, action.phaseNumber);

				if (!dayActions.get(action.phaseNumber)) dayActions.set(action.phaseNumber, []);
				if (action.user) dayActions.get(action.phaseNumber)?.push(` - **${action.user.user.username}** ${action.actionDetails}`);
				else dayActions.get(action.phaseNumber)?.push(` - ${action.actionDetails}`);
			});

		archive.actions
			.filter((action) => action.phase === 'night')
			.forEach((action) => {
				largestPhaseNumber = Math.max(largestPhaseNumber, action.phaseNumber);

				if (!nightActions.get(action.phaseNumber)) nightActions.set(action.phaseNumber, []);
				if (action.user) nightActions.get(action.phaseNumber)?.push(` - **${action.user.user.username}** ${action.actionDetails}`);
				else nightActions.get(action.phaseNumber)?.push(` - ${action.actionDetails}`);
			});

		const list: string[] = [];

		if (preGame.length > 0) {
			list.push(`- Pre-Game`);
			list.push(
				...preGame.map((action) => {
					if (action.user) return ` - **${action.user.user.username}** ${action.actionDetails}`;
					else return ` - ${action.actionDetails}`;
				})
			);
		}

		for (let i = 0; i <= largestPhaseNumber; i++) {
			const day = dayActions.get(i);
			const night = nightActions.get(i);
			if (!day && !night) continue;

			if (day) {
				list.push(`- Day ${i}`);
				list.push(...day);
			}

			if (night) {
				list.push(`- Night ${i}`);
				list.push(...night);
			}
		}

		if (postGame.length > 0) {
			list.push(`- Post-Game`);
			list.push(
				...postGame.map((action) => {
					if (action.user) return ` - **${action.user.user.username}** ${action.actionDetails}`;
					else return ` - ${action.actionDetails}`;
				})
			);
		}

		if (list.length > 0) format += list.join('\n') + '\n';
	}

	if (archive.spreadsheetURL) format += `## Spreadsheet\n${archive.spreadsheetURL}\n`;

	if (archive.urls.length > 0) {
		format += `## URLs\n`;
		archive.urls.forEach((url) => {
			format += `- ${url.name}: ${url.url}\n`;
		});
	}

	return { content: format, image: archive.spreadsheetImageURL };
}

export function formatArchiveEmbed(archive: FullArchive) {
	const embed = new EmbedBuilder();
	embed.setColor('White');
	embed.setTitle(`${archive.gameHandle.toUpperCase()}: ${archive.gameTitle}`);
	const hostList = archive.users
		.filter((user) => user.isHost)
		.map((user) => '- ' + user.user.username)
		.join('\n');
	if (hostList.length > 0) embed.addFields({ name: 'Hosts', value: hostList });

	const coHostList = archive.users
		.filter((user) => user.isCoHost)
		.map((user) => '- ' + user.user.username)
		.join('\n');
	if (coHostList.length > 0) embed.addFields({ name: 'Co-Hosts', value: coHostList });

	const winnerListFormat = new Map<string, string[]>();
	archive.users
		.filter((user) => user.isWinner)
		.forEach((v) => {
			if (v.role && v.alignment) {
				if (!winnerListFormat.get(v.alignment)) winnerListFormat.set(v.alignment, []);
				winnerListFormat.get(v.alignment)?.push(` - **${v.user.username}** as ${v.role}`);
			}
		});
	if (winnerListFormat.size > 0) {
		embed.addFields({
			name: 'Winners',
			value: Array.from(winnerListFormat.entries())
				.map(([k, v]) => {
					return `- **${k}**\n${v.join('\n')}`;
				})
				.join('\n'),
		});
	}

	const loserListFormat = new Map<string, string[]>();
	archive.users
		.filter((user) => user.isLoser)
		.forEach((v) => {
			if (v.role && v.alignment) {
				if (!loserListFormat.get(v.alignment)) loserListFormat.set(v.alignment, []);
				loserListFormat.get(v.alignment)?.push(` - **${v.user.username}** as ${v.role}`);
			}
		});
	if (loserListFormat.size > 0) {
		embed.addFields({
			name: 'Losers',
			value: Array.from(loserListFormat.entries())
				.map(([k, v]) => {
					return `- **${k}**\n${v.join('\n')}`;
				})
				.join('\n'),
		});
	}

	if (archive.actions.length > 0) {
		const preGame = archive.actions.filter((action) => action.phase === 'pregame');
		const postGame = archive.actions.filter((action) => action.phase === 'postgame');

		const dayActions = new Map<number, string[]>();
		const nightActions = new Map<number, string[]>();

		let largestPhaseNumber = 0;

		archive.actions
			.filter((action) => action.phase === 'day')
			.forEach((action) => {
				largestPhaseNumber = Math.max(largestPhaseNumber, action.phaseNumber);

				if (!dayActions.get(action.phaseNumber)) dayActions.set(action.phaseNumber, []);
				if (action.user) dayActions.get(action.phaseNumber)?.push(` - **${action.user.user.username}** ${action.actionDetails}`);
				else dayActions.get(action.phaseNumber)?.push(` - ${action.actionDetails}`);
			});

		archive.actions
			.filter((action) => action.phase === 'night')
			.forEach((action) => {
				largestPhaseNumber = Math.max(largestPhaseNumber, action.phaseNumber);

				if (!nightActions.get(action.phaseNumber)) nightActions.set(action.phaseNumber, []);
				if (action.user) nightActions.get(action.phaseNumber)?.push(` - **${action.user.user.username}** ${action.actionDetails}`);
				else nightActions.get(action.phaseNumber)?.push(` - ${action.actionDetails}`);
			});

		const list: string[] = [];

		if (preGame.length > 0) {
			list.push(`- Pre-Game`);
			list.push(
				...preGame.map((action) => {
					if (action.user) return ` - **${action.user.user.username}** ${action.actionDetails}`;
					else return ` - ${action.actionDetails}`;
				})
			);
		}

		for (let i = 0; i <= largestPhaseNumber; i++) {
			const day = dayActions.get(i);
			const night = nightActions.get(i);
			if (!day && !night) continue;

			if (day) {
				list.push(`- Day ${i}`);
				list.push(...day);
			}

			if (night) {
				list.push(`- Night ${i}`);
				list.push(...night);
			}
		}

		if (postGame.length > 0) {
			list.push(`- Post-Game`);
			list.push(
				...postGame.map((action) => {
					if (action.user) return ` - **${action.user.user.username}** ${action.actionDetails}`;
					else return ` - ${action.actionDetails}`;
				})
			);
		}

		if (list.length > 0) embed.addFields({ name: 'Game History', value: list.join('\n') });
	}

	if (archive.spreadsheetURL) embed.addFields({ name: 'Spreadsheet', value: archive.spreadsheetURL });
	if (archive.urls.length > 0) {
		embed.addFields({
			name: 'URLs',
			value: archive.urls.map((url) => `- ${url.name ? url.name + ': ' : ''}${url.url}`).join('\n'),
		});
	}

	if (archive.spreadsheetImageURL) embed.setThumbnail(archive.spreadsheetImageURL);

	return embed;
}
