import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Snowflake } from 'discord.js';
import { FullSignup } from './database';
import { sign } from 'crypto';
import { turboExpirySeconds } from '../clock/turbos';

export function formatSignupEmbed(signup: FullSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name ?? 'Game Signups');
	embed.setDescription('Click the appropriate buttons to join a category');
	embed.setColor('Blurple');
	const row = new ActionRowBuilder<ButtonBuilder>();

	const totalUsers: Snowflake[] = [];

	if (signup.isTurbo) {
		const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
		embed.addFields({
			name: 'Expiry',
			value: 'This lobby exires <t:' + (currentTimestampInSeconds + turboExpirySeconds) + ':R>',
		});
	}

	for (const category of signup.categories) {
		const { name, isLocked, limit } = category;
		const userIds = category.users
			.sort((a, b) => (a.isTurboHost && !b.isTurboHost ? -1 : 1))
			.map((user, index) => {
				totalUsers.push(user.user.discordId);
				return `> ${index + 1}. ${user.user.username}${user.isTurboHost ? ' (Host)' : ''}`;
			});

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
		if (isLocked || (limit && limit > 0 && userIds.length >= limit)) button.setDisabled(true);
		button.setStyle(category.isFocused ? ButtonStyle.Primary : ButtonStyle.Secondary);

		row.addComponents(button);
	}

	row.addComponents(new ButtonBuilder().setCustomId('button-category_leave').setEmoji('❌').setStyle(ButtonStyle.Secondary));
	row.addComponents(new ButtonBuilder().setCustomId('button-category_settings').setEmoji('⚙').setStyle(ButtonStyle.Secondary));

	if (totalUsers.length <= 0 || (signup.isTurbo && !signup.isActive)) {
		embed.setFields([]);
		embed.setDescription('This turbo lobby has been closed.');
		embed.setTimestamp(new Date());
		embed.setColor('Red');
		for (const button of row.components) {
			button.setDisabled(true);
		}
	}

	return { embed, row };
}
