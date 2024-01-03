import type { Guild, PermissionOverwriteOptions, RoleResolvable, TextChannel, UserResolvable } from 'discord.js';
import { ChannelType } from 'discord.js';

export async function editChannelPermission(channel: TextChannel, userOrRole: RoleResolvable | UserResolvable, payload: PermissionOverwriteOptions) {
	return await channel.permissionOverwrites.edit(userOrRole, payload).catch(() => null);
}

export async function createCategory(guild: Guild, name: string) {
	const category = await guild.channels
		.create({
			name,
			type: ChannelType.GuildCategory,
		})
		.catch(() => null);

	return category;
}

export async function createTextChannel(guild: Guild, name: string, parent?: string) {
	const channel = await guild.channels
		.create({
			name,
			type: ChannelType.GuildText,
			parent,
		})
		.catch(() => null);

	return channel;
}
