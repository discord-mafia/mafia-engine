import { ChannelType, Client, Guild } from 'discord.js';
import { sendErrorLog, sendLog } from '../structures/logs';
import { client, prisma } from '..';
import { FullSignup, getSignup } from '../util/database';
import { formatSignupEmbed } from '../util/embeds';
import config from '../config';
import { sign } from 'crypto';

export const turboExpirySeconds = 60 * 60 * 3;

export async function checkExpiredTurbos(client: Client) {
	const turboList = await getExpiredTurbos();
	for (const turbo of turboList) {
		const { channelId, messageId, serverId } = turbo;
		const guild = await client.guilds.fetch(serverId);
		if (!guild) continue;
		const channel = guild.channels.cache.get(channelId);
		if (!channel || channel.type != ChannelType.GuildText) continue;
		const message = await channel.messages.fetch(messageId);
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

export async function turboSignupFull(signup: FullSignup) {}
