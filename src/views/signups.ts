import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type UserSelectMenuBuilder, type Snowflake, BaseMessageOptions } from 'discord.js';
import { type FullSignup } from '@models/signups';
import removeUser from '@root/events/buttons/manageSignups/removePlayer';
import SignupRemovePlayerMenu from '@root/events/selectMenus/removeUserFromSignup';
import viewDatabaseInfo from '@root/events/buttons/manageSignups/viewDatabaseInfo';
import gotoHome from '@root/events/buttons/manageSignups/gotoHome';
import manageSpecificQueue from '@root/events/buttons/manageSignups/manageCategories';
import connectFeature from '@root/events/buttons/manageSignups/connectFeature';

export function formatSignupEmbed(signup: FullSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name ?? 'Game Signups');
	embed.setDescription('Click the appropriate buttons to join a category');
	embed.setColor('Blurple');

	const row = new ActionRowBuilder<ButtonBuilder>();
	const totalUsers: Snowflake[] = [];

	const hostList = signup.hosts.map((host) => host.user.username);
	const moderatorList = signup.moderators.map((moderator) => moderator.user.username);
	const balancerList = signup.balancers.map((balancer) => balancer.user.username);

	if ([...hostList, ...moderatorList, ...balancerList].length > 0) {
		embed.setDescription((embed.data.description += '\n\n**__[ RUN BY ]__**'));

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

				let categoryName = name;
				if (categoryName.endsWith('s')) categoryName = categoryName.slice(0, -1);

				if (signup.isAnonymous) {
					return `> ${index + 1}. Anonymous ${categoryName}`;
				} else {
					return `> ${index + 1}. ${user.user.username}${user.isTurboHost ? ' (Host)' : ''}`;
				}
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

	return { embed, row };
}

export function genSignupSettingsEmbed(signup: FullSignup) {
	const embed = new EmbedBuilder();
	embed.setColor('White');
	embed.setTitle('Signup Management');
	embed.setDescription('This is your hub to manage the signup. Only designated hosts and admins can access this.');

	if (signup.isAnonymous) {
		for (const category of signup.categories) {
			if (category.users.length == 0) continue;
			const name = category.name;
			const users = category.users;

			let userStr = '```';
			for (const user of users) {
				userStr += `${user.user.username}\n`;
			}
			userStr += '```';

			embed.addFields({
				name: name,
				value: userStr,
				inline: true,
			});
		}
	}

	for (const category of signup.categories) {
		if (category.users.length == 0) continue;
		const name = category.name;
		const users = category.users;

		let userStr = '```';
		for (const user of users) {
			userStr += `<@${user.user.discordId}>\n`;
		}
		userStr += '```';

		embed.addFields({
			name: name,
			value: userStr,
			inline: true,
		});
	}

	embed.addFields(
		{
			name: 'Signup Index',
			value: '> ' + signup.id.toString(),
			inline: true,
		},
		{
			name: 'Category Index List',
			value: signup.categories.length > 0 ? signup.categories.map((x) => `> ${x.name} - ${x.id}`).join('\n') : '> None',
			inline: true,
		}
	);

	return embed;
}

export function genSignupSettingsComponents(signup: FullSignup) {
	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(removeUser.build(signup.messageId));
	return row;
}

export function genSignupRemovePlayersComponents(signup: FullSignup) {
	const row = new ActionRowBuilder<UserSelectMenuBuilder>();
	row.addComponents(SignupRemovePlayerMenu.build(signup.messageId));
	return row;
}

type BasicEmbedOptions = {
	title?: string;
};
function getBasicEmbed(options: BasicEmbedOptions = {}): EmbedBuilder {
	const embed = new EmbedBuilder();
	embed.setTitle('Signup Management');
	embed.setDescription('This is your hub to manage the signup. Only designated hosts and admins can access this.');
	if (options.title) embed.setTitle(embed.data.title + ` - ${options.title}`);
	return embed;
}

export function signupSettingsMain(signup: FullSignup): BaseMessageOptions {
	const embed = getBasicEmbed();

	const categories = signup.categories.map((v) => `> ${v.name} ${v.limit > 0 ? `(${v.users.length}/${v.limit})` : `(${v.users.length}`})`);
	embed.addFields({
		name: 'Categories',
		value: categories.length > 0 ? categories.join('\n') : '> None',
	});

	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(manageSpecificQueue.build(signup.messageId), connectFeature.build(signup.messageId), viewDatabaseInfo.build(signup.messageId));

	return {
		embeds: [embed],
		components: [row],
	};
}

export function signupSettingsDatabase(signup: FullSignup): BaseMessageOptions {
	const embed = getBasicEmbed({ title: 'Database' });
	embed.addFields(
		{
			name: 'Signup Index',
			value: '> ' + signup.id.toString(),
			inline: true,
		},
		{
			name: 'Category Index List',
			value: signup.categories.length > 0 ? signup.categories.map((x) => `> ${x.name} - ${x.id}`).join('\n') : '> None',
			inline: true,
		}
	);

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(gotoHome.build(signup.messageId));

	return { embeds: [embed], components: [row] };
}

export function signupSettingsManageCategory(signup: FullSignup, categoryID: number): BaseMessageOptions {
	const category = signup.categories.find((v) => v.id === categoryID);
	if (!category) return signupSettingsMain(signup);

	const embed = getBasicEmbed({ title: category.name });

	const name = category.name;
	const users = category.users;

	let userStr = '```';
	for (const user of users) {
		userStr += `<@${user.user.discordId}> - ${user.user.username}\n`;
	}
	if (users.length === 0) userStr += 'None Yet...';
	userStr += '```';

	embed.addFields({
		name: name,
		value: userStr,
		inline: true,
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(gotoHome.build(signup.messageId), removeUser.build(signup.messageId));

	return { embeds: [embed], components: [row] };
}
