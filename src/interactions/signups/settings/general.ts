import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	PermissionFlagsBits,
} from 'discord.js';
import {
	getHydratedSignupFromChannel,
	HydratedSignup,
} from '../../../db/signups';
import { Button } from '../../../builders/button';
import { generalCategoriesEmbed } from './categories';
import { InteractionError, ErrorCode } from '../../../utils/errors';
import { generalMiscEmbed } from './misc';

export const helpCategoryButton = new Button('signup-help')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('❔')
	.onExecute(async (i) => {
		const helpStr =
			'This is a placeholder for help\nPlease contact Mel (or another member of staff) if you have any questions';
		await i.reply({ ephemeral: true, content: `\`\`\`${helpStr}\`\`\`` });
	});

export const manageCategories = new Button('signup-manage-categories')
	.setLabel('Categories')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		if (!i.channelId)
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message: 'This button can only be used in a channel',
			});
		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		const { embed, row } = await generalCategoriesEmbed(signup);
		await i.update({ embeds: [embed], components: [row] });
	});

export const miscSettings = new Button('signup-manage-misc')
	.setLabel('Misc Settings')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		if (!i.channelId)
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message: 'This button can only be used in a channel',
			});
		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		const { embed, row } = await generalMiscEmbed(signup);
		await i.update({ embeds: [embed], components: [row] });
	});

export const signupSettingsHome = new Button('signup-settings-home')
	.setLabel('Home')
	.setStyle(ButtonStyle.Primary)
	.onExecute(async (i) => {
		if (!i.channelId)
			throw new InteractionError({
				status: ErrorCode.NotPermitted,
				message: 'This button can only be used in a channel',
			});

		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		const { embed, row } = await generalSettingsEmbed(signup);
		await i.update({ embeds: [embed], components: [row] });
	});

export async function generalSettingsEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name);
	embed.setColor('White');
	embed.setDescription(
		"Click the buttons below to edit the signup's settings"
	);

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(manageCategories.build());
	row.addComponents(miscSettings.build());
	row.addComponents(createPlayerChatButton.build());
	row.addComponents(helpCategoryButton.build());

	return {
		embed,
		row,
	};
}

const createPlayerChatButton = new Button('signup-create-pc')
	.setStyle(ButtonStyle.Secondary)
	.setEmoji('👤')
	.onExecute(async (i) => {
		if (!i.user) throw new InteractionError('Failed to fetch user');
		if (!i.guild) throw new InteractionError('Failed to fetch guild');

		const member = await i.guild.members.fetch(i.user.id);
		if (!member) throw new InteractionError('Failed to fetch member');

		if (!member.permissions.has(PermissionFlagsBits.Administrator))
			throw new InteractionError(
				'You must be an admin to use this button'
			);

		const client = i.client;
		if (!client) throw new InteractionError('Failed to fetch client');

		await i.deferReply({ ephemeral: true });

		await client.guilds.fetch();
		const playerChatServer = client.guilds.cache.get('753231987589906483');
		if (!playerChatServer)
			throw new InteractionError('Failed to fetch player chat server');

		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup)
			throw new InteractionError({
				status: ErrorCode.NotFound,
				message: 'Failed to find signup',
			});

		const hostIds: string[] = [];

		for (const category of signup.categories) {
			if (category.name == 'Hosts' || category.name == 'Moderators') {
				for (const user of category.users) {
					hostIds.push(user.id);
				}
			}
		}

		const category = await playerChatServer.channels.create({
			name: signup.name,
			type: ChannelType.GuildCategory,
			permissionOverwrites: [
				{
					id: playerChatServer.roles.everyone.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				...hostIds.map((id) => {
					return {
						id,
						allow: [
							PermissionFlagsBits.ViewChannel,
							PermissionFlagsBits.ManageChannels,
							PermissionFlagsBits.ManageWebhooks,
						],
					};
				}),
			],
		});

		const hostPanelChannel = await playerChatServer.channels.create({
			name: 'host-panel',
			type: ChannelType.GuildText,
			parent: category.id,
		});

		await i.editReply({
			content: `Channel ID: <#${hostPanelChannel.id}>`,
		});
	});
