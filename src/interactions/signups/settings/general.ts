import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from 'discord.js';
import {
	getHydratedSignupFromChannel,
	HydratedSignup,
} from '../../../db/signups';
import { Button } from '../../../builders/button';
import { generalCategoriesEmbed } from './categories';
import { InteractionError, ErrorCode } from '../../../utils/errors';
import { generalMiscEmbed } from './misc';

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

	return {
		embed,
		row,
	};
}
