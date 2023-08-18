import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { getSignup } from '../../util/database';
import { formatSignupEmbed } from '../../util/embeds';
import { prisma } from '../..';

const data = new SlashCommandBuilder().setName('signups').setDescription('Create a signup post');
data.addRoleOption((role) => role.setName('hostrole').setDescription('Role that the host/s have').setRequired(true));
data.addStringOption((title) => title.setName('title').setDescription('Title for the signup').setRequired(false));
data.addIntegerOption((limit) => limit.setName('limit').setDescription('Limit the number of signups').setRequired(false));

export default newSlashCommand({
	data,
	serverType: ServerType.MAIN,
	execute: async (i: ChatInputCommandInteraction) => {
		const title = i.options.getString('title') ?? 'Game Signups';
		const limit = i.options.getInteger('limit') ?? undefined;
		const role = i.options.getRole('role', true);

		if (!i.guild || !i.channelId) return i.reply({ content: 'This command can only be used in a server.', ephemeral: true });

		const deferred = await i.deferReply({ fetchReply: true });
		const signup = await prisma.signup.create({
			data: {
				name: title,
				channelId: i.channelId,
				messageId: deferred.id,
				serverId: i.guild.id,
				hostRoleId: role.id,
				categories: {
					createMany: {
						skipDuplicates: true,
						data: [
							{
								name: 'Players',
								limit: limit,
								emoji: '✅',
								buttonName: 'Play',
								isFocused: true,
							},
							{
								name: 'Backups',
								emoji: '❔',
								buttonName: 'Backup',
							},
						],
					},
				},
			},
		});

		const fetchedSignup = await getSignup({ signupId: signup.id });
		if (!fetchedSignup) return i.editReply({ content: 'Failed to create signup post.' });

		const { embed, row } = formatSignupEmbed(fetchedSignup);
		await i.editReply({ content: '', embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
	},
});
