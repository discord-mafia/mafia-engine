import {
	APIApplicationCommandOptionChoice,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	ColorResolvable,
	EmbedBuilder,
	ForumChannel,
	GuildForumTag,
	GuildMember,
	InviteTargetType,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import axios from 'axios';
import { load } from 'cheerio';
import { format } from 'path';

const data = new SlashCommandBuilder().setName('test').setDescription('TEST');
data.addChannelOption((option) =>
	option.setName('channel').setDescription('The channel to send the message to').setRequired(true).addChannelTypes(ChannelType.GuildForum)
);
export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const forumChannel = i.options.getChannel('channel', true) as ForumChannel;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('test').setLabel('See Player Mentions').setStyle(ButtonStyle.Secondary)
		);

		const tags: GuildForumTag[] = forumChannel.availableTags;

		forumChannel.threads.create({
			name: 'Test Archive',
			message: {
				content: 'Imagine an archive is here ig',
				components: [row],
			},
		});

		await i.reply({ content: 'Done', ephemeral: true });
	},
});
