import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { FullSignup } from './database';

export function formatSignupEmbed(signup: FullSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name ?? 'Game Signups');
	embed.setDescription('Click the appropriate buttons to join a category');

	const row = new ActionRowBuilder<ButtonBuilder>();

	for (const category of signup.categories) {
		const { name, isLocked, limit } = category;
		const userIds = category.users.map((user, index) => `> ${index + 1}. ${user.user.username}`);

		let fieldName = `${name}${limit && limit > 0 ? ` (${userIds.length}/${limit})` : ` (${userIds.length})`}`;
		let value = userIds.join('\n').trim();

		embed.addFields({
			name: fieldName,
			value: value == '' ? '> None' : value,
			inline: true,
		});

		const button = new ButtonBuilder();
		button.setCustomId(`button-category_${category.id}`);
		button.setLabel(category.buttonName ? category.buttonName : `Join ${name}`);
		if (category.emoji) button.setEmoji(category.emoji);
		if (isLocked || (limit && limit > 0 && userIds.length >= limit)) button.setDisabled(true);
		button.setStyle(ButtonStyle.Secondary);

		row.addComponents(button);
	}

	row.addComponents(new ButtonBuilder().setCustomId('button-category_leave').setEmoji('❌').setStyle(ButtonStyle.Secondary));
	row.addComponents(new ButtonBuilder().setCustomId('button-category_settings').setEmoji('⚙').setStyle(ButtonStyle.Secondary));

	return { embed, row };
}
