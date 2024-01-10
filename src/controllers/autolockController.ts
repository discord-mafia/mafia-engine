import { type AutoLocker } from '@prisma/client';
import { prisma } from '..';
import { ChannelType } from 'discord.js';
import { editChannelPermission } from '@utils/discordChannels';
import { getGuilds } from './botController';

const CRON_LOOP_INTERVAL = 1000 * 60;

export async function autoLockLoop() {
	const startTime = Date.now();
	const filtered = await prisma.autoLocker.findMany({ where: { lockAt: { lte: new Date(startTime) } } });
	const guilds = await getGuilds(true);

	for (const autoLockChannel of filtered) {
		const guild = guilds.get(autoLockChannel.guildId);
		if (!guild) {
			await deleteAutoLockChannel(autoLockChannel);
			continue;
		}

		const channel = await guild.channels.fetch(autoLockChannel.channelId);
		if (!channel || channel.type != ChannelType.GuildText) {
			await deleteAutoLockChannel(autoLockChannel);
			continue;
		}

		try {
			if (!channel.permissionsFor(autoLockChannel.roleId)?.has('SendMessages')) {
				await deleteAutoLockChannel(autoLockChannel);
				continue;
			}
			await editChannelPermission(channel, autoLockChannel.roleId, { SendMessages: false });
			channel.send({
				content: `<@&${autoLockChannel.roleId}> has been locked from sending messages in this channel`,
				allowedMentions: { roles: [] },
			});
			await deleteAutoLockChannel(autoLockChannel);
		} catch (err) {
			console.error(err);
			await deleteAutoLockChannel(autoLockChannel);
		}
	}

	setTimeout(autoLockLoop, CRON_LOOP_INTERVAL - (Date.now() - startTime));
}

async function deleteAutoLockChannel(autoLocker: AutoLocker) {
	try {
		await prisma.autoLocker.delete({ where: { id: autoLocker.id } });
	} catch (err) {
		console.error(err);
	}
}
