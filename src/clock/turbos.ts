import { ChannelType, Client, Guild, GuildMember } from 'discord.js';
import { sendErrorLog, sendLog } from '../structures/logs';
import { client, prisma } from '..';
import { FullSignup, getOrCreateUser, getSignup } from '../util/database';
import { formatSignupEmbed } from '../util/embeds';
import config from '../config';
import { sign } from 'crypto';
import { Player } from '@prisma/client';

export const turboExpirySeconds = 60 * 60 * 3;

async function getMessage(guild: Guild, channelId: string, messageId: string) {
	try {
		const channel = guild.channels.cache.get(channelId);
		if (!channel || channel.type != ChannelType.GuildText) return null;
		const message = await channel.messages.fetch(messageId);
		return message ?? null;
	} catch (err) {
		return null;
	}
}

export async function checkExpiredTurbos(client: Client) {
	try {
		const turboList = await getExpiredTurbos();
		for (const turbo of turboList) {
			const { channelId, messageId, serverId } = turbo;
			if (!turbo.isTurbo) continue;

			const guild = await client.guilds.fetch(serverId);
			if (!guild) continue;

			const message = await getMessage(guild, channelId, messageId);
			if (!message) continue;

			await prisma.signup.update({
				where: {
					id: turbo.id,
				},
				data: {
					isActive: false,
				},
			});

			const fetchedSignup = await getSignup({ signupId: turbo.id });
			if (!fetchedSignup) continue;

			const { embed, row } = formatSignupEmbed(fetchedSignup);
			await message.edit({ content: '', embeds: [embed], components: row.components.length > 0 ? [row] : undefined });
		}
	} catch (err) {}
}

async function getExpiredTurbos() {
	try {
		const expiryNumber = Date.now() - 1000 * turboExpirySeconds;
		const turbos = await prisma.signup.findMany({
			where: {
				isActive: true,
				isTurbo: true,
				createdAt: {
					lt: new Date(expiryNumber),
				},
			},
		});

		return turbos;
	} catch (err) {
		sendErrorLog('Failed to get expired turbos', err);
		console.log(err);
		return [];
	}
}

export function isTurboFull(signup: FullSignup) {
	if (!signup.isTurbo) return false;

	const category = signup.categories.find((c) => c.isFocused);
	if (!category) return false;

	if (category.users.length >= category.limit) return true;
	return false;
}

export async function turboSignupFull(signup: FullSignup) {
	const guild = await client.guilds.fetch(signup.serverId);
	if (!guild) return;
	const message = await getMessage(guild, signup.channelId, signup.messageId);
	if (!message) return;

	message.channel.send({ content: `Turbo signup is full. Imagine there's confirmation functionality here`, allowedMentions: { users: [] } });

	const players: GuildMember[] = [];
	const focusedCategory = signup.categories.find((c) => c.isFocused);
	if (!focusedCategory) return;

	console.log('Here');

	try {
		const game = await prisma.automatedGame.create({
			data: {
				guildId: guild.id,
			},
		});

		if (!game) return;

		for (const user of focusedCategory.users) {
			const member = await guild.members.fetch(user.user.discordId);
			if (!member) continue;

			const userDB = await getOrCreateUser(member);
			if (!userDB) continue;

			await prisma.player.create({
				data: {
					discordId: member.id,
					automatedGameId: game.id,
				},
			});
		}

		const savedPlayerCount = await prisma.player.count({ where: { automatedGameId: game.id } });
		if (savedPlayerCount < focusedCategory.users.length)
			return message.channel.send({ content: `Failed to find all players in turbo signup.`, allowedMentions: { users: [] } });

		const category = await guild.channels.create({
			name: `Turbo ${game.id}`,
			type: ChannelType.GuildCategory,
			permissionOverwrites: [
				{
					id: guild.roles.everyone.id,
					deny: ['ViewChannel'],
				},
			],
		});

		const infoChannel = await guild.channels.create({
			name: `turbo-info`,
			type: ChannelType.GuildText,
			parent: category,
			permissionOverwrites: [
				{
					id: guild.roles.everyone.id,
					allow: ['ViewChannel'],
				},
				{
					id: guild.roles.everyone.id,
					deny: ['SendMessages'],
				},
			],
		});

		const chatChannel = await guild.channels.create({
			name: `turbo-chat`,
			type: ChannelType.GuildText,
			parent: category,
			permissionOverwrites: [
				{
					id: guild.roles.everyone.id,
					allow: ['ViewChannel'],
				},
				{
					id: guild.roles.everyone.id,
					deny: ['SendMessages'],
				},
			],
		});

		const mafiaChannel = await guild.channels.create({
			name: `turbo-mafia`,
			type: ChannelType.GuildText,
			parent: category,
		});

		const updatedGame = await prisma.automatedGame.update({
			where: {
				id: game.id,
			},
			data: {
				infoChannelId: infoChannel.id,
				chatChannelId: chatChannel.id,
				mafiaChannelId: mafiaChannel.id,
			},
		});

		await prisma.signup.update({
			where: {
				id: signup.id,
			},
			data: {
				isActive: false,
			},
		});

		signup.isActive = false;
		const format = formatSignupEmbed(signup);
		const { embed, row } = format;
		embed.setColor('Green');
		await message.edit({ embeds: [embed], components: [row] });
	} catch (err) {
		console.log(err);
	}
}
