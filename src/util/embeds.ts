import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type Snowflake } from 'discord.js';
import { type FullSignup } from './database';
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

	const hostList = signup.hosts.map((host) => host.user.username);
	const moderatorList = signup.moderators.map((moderator) => moderator.user.username);
	const balancerList = signup.balancers.map((balancer) => balancer.user.username);

	if ([...hostList, ...moderatorList, ...balancerList].length > 0) {
		embed.setDescription((embed.data.description += `\n\n**__[ RUN BY ]__**`));

		if (hostList.length > 0) {
			embed.addFields({
				name: 'Hosts',
				value: `> ${hostList.join('\n> ')}`,
				inline: true,
			});
		}

		if (moderatorList.length > 0) {
			embed.addFields({
				name: 'Moderator',
				value: `> ${moderatorList.join('\n> ')}`,
				inline: true,
			});
		}

		if (balancerList.length > 0) {
			embed.addFields({
				name: 'Balancers',
				value: `> ${balancerList.join('\n> ')}`,
				inline: true,
			});
		}
	}
	embed.addFields({
		name: '\u200B',
		value: '**__[ SIGNED UP ]__**',
	});
	// Order by focused first
	const sortedCategories = signup.categories.sort((a, b) => (a.isFocused && !b.isFocused ? -1 : 1));

	for (const category of sortedCategories) {
		const { name, isLocked, limit } = category;
		const userIds = category.users
			.sort((a, b) => (a.isTurboHost && !b.isTurboHost ? -1 : 1))
			.map((user, index) => {
				totalUsers.push(user.user.discordId);
				return `> ${index + 1}. ${user.user.username}${user.isTurboHost ? ' (Host)' : ''}`;
			});

		const fieldName = `${name}${limit && limit > 0 ? ` (${userIds.length}/${limit})` : ` (${userIds.length})`}`;
		const value = userIds.join('\n').trim();

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

	if (signup.isTurbo) {
		if (totalUsers.length <= 0 || !signup.isActive) {
			embed.setFields([]);
			embed.setDescription('This turbo lobby has been closed.');
			embed.setTimestamp(new Date());
			embed.setColor('Red');
			for (const button of row.components) {
				button.setDisabled(true);
			}
		}
	}

	return { embed, row };
}
