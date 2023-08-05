import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { getOrCreateUser, getSignup } from '../../util/database';
import { formatSignupEmbed } from '../../util/embeds';
import { prisma } from '../..';
import config from '../../config';

const data = new SlashCommandBuilder().setName('turbo').setDescription('Start a turbo game');

data.addSubcommand((sub) =>
	sub
		.setName('setup')
		.setDescription('Start a turbo signups for a specific game')
		.addStringOption((x) =>
			x.setName('setup').setDescription('Game to start a turbo for').setRequired(true).setChoices({
				name: 'Think Twice (5p)',
				value: 'thinktwice',
			})
		)
		.addStringOption((x) => x.setName('days').setDescription('Day length in minutes. Default = 20').setRequired(false))
		.addStringOption((x) => x.setName('nights').setDescription('Night length in minutes. Default = 10').setRequired(false))
);

export default newSlashCommand({
	data,
	serverType: [ServerType.MAIN, ServerType.TURBO],
	execute: async (i: ChatInputCommandInteraction) => {
		const setup = i.options.getString('setup', true);
		const days = i.options.getString('days', false) ?? 20;
		const nights = i.options.getString('nights', false) ?? 10;

		const member = await i.guild?.members.fetch(i.user.id);
		if (!member) return i.reply({ content: 'You must be in the server to use this command.', ephemeral: true });
		const user = await getOrCreateUser(member);
		if (!user) return i.reply({ content: 'Failed to create user.', ephemeral: true });

		const limit = 5;

		if (!i.guild || !i.channelId) return i.reply({ content: 'This command can only be used in a server.', ephemeral: true });

		const deferred = await i.deferReply({ fetchReply: true });
		const signup = await prisma.signup.create({
			data: {
				name: `TURBO: Think Twice`,
				channelId: i.channelId,
				messageId: deferred.id,
				serverId: i.guild.id,
				isTurbo: true,
				requiredServers: [config.TURBO_SERVER_ID],
			},
		});

		const category = await prisma.signupCategory.create({
			data: {
				name: 'Players',
				limit: limit,
				buttonName: 'Play',
				isFocused: true,
				signupId: signup.id,
			},
		});

		await prisma.signupUserJunction.create({
			data: {
				signupCategoryId: category.id,
				userId: user.id,
				isTurboHost: true,
			},
		});

		const fetchedSignup = await getSignup({ signupId: signup.id });
		if (!fetchedSignup) return i.editReply({ content: 'Failed to create signup post.' });
		const { embed, row } = formatSignupEmbed(fetchedSignup);
		await i.editReply({ content: '', embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
	},
});
