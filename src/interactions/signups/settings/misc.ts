import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';
import { Button } from '../../../builders/button';
import { HydratedSignup } from '../../../db/signups';
import { manageCategories, miscSettings, signupSettingsHome } from './general';

export const editSignupName = new Button('signup-edit-title')
	.setLabel('Change Name')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const toggleAnonymity = new Button('signup-edit-anonymity')
	.setLabel('Toggle Anonymity')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export async function generalMiscEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Misc - ${signup.name}`);
	embed.setColor('White');

	embed.setDescription('Manage assorted misc settings with this signup');

	embed.addFields({
		name: 'Anonymity',
		value: `> ${signup.isAnonymous ? 'Enabled' : 'Disabled'}`,
		inline: true,
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(signupSettingsHome.build());
	row.addComponents(editSignupName.build());
	row.addComponents(toggleAnonymity.build());

	return {
		embed,
		row,
	};
}
