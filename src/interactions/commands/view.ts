import {
	APIApplicationCommandOptionChoice,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	ColorResolvable,
	EmbedBuilder,
	ForumChannel,
	GuildMember,
	InviteTargetType,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import { addQueueOptions, formatArchiveEmbed, getGameTag } from './archive';
import { getArchive } from '../../util/database';
import { formatArchive } from './archive';
import { Button } from '../../structures/interactions';
import viewArchiveMentions from '../buttons/viewArchiveMentions';
const data = new SlashCommandBuilder().setName('view').setDescription('View something');

data.addSubcommand((subcommand) =>
	subcommand
		.setName('archive')
		.setDescription('View an archive')
		.addStringOption(addQueueOptions)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) =>
			opt
				.setName('type')
				.setDescription('The format to post this in')
				.setChoices(
					...[
						{
							name: 'Embed',
							value: 'embed',
						},
						{
							name: 'Text',
							value: 'text',
						},
					]
				)
		)
		.addBooleanOption((opt) => opt.setName('hidden').setDescription('Whether to see this just for yourself').setRequired(false))
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);
		switch (subcommand) {
			case 'archive':
				return viewArchive(i);
			default:
				return i.reply({ content: 'Invalid subcommand', ephemeral: true });
		}
	},
});

async function viewArchive(i: ChatInputCommandInteraction) {
	const queue = i.options.getString('queue', true);
	const number = i.options.getInteger('number', true);
	const formatType = i.options.getString('type', false);
	const hidden = i.options.getBoolean('hidden', false) ?? false;

	const gameTag = getGameTag(queue, number);

	await i.deferReply({ ephemeral: hidden });

	const archive = await getArchive(gameTag);
	if (!archive) return i.editReply({ content: 'This archive does not exist' });

	if (formatType === 'embed') {
		const data = formatArchiveEmbed(archive);
		if (!data) return i.editReply({ content: 'This archive does not exist' });

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(viewArchiveMentions.createCustomID(gameTag)).setLabel('View Mentions').setStyle(ButtonStyle.Secondary)
		);

		return i.editReply({
			embeds: [data],
			components: [row],
		});
	} else {
		const data = formatArchive(archive);
		if (!data) return i.editReply({ content: 'This archive does not exist' });
		const { content, image } = data;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(viewArchiveMentions.createCustomID(gameTag)).setLabel('View Mentions').setStyle(ButtonStyle.Secondary)
		);
		return i.editReply({
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
		});
	}
}
