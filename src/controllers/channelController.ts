import { type PermissionOverwriteOptions, type RoleResolvable, type TextChannel, type UserResolvable } from 'discord.js';

export async function editChannelPermission(channel: TextChannel, userOrRole: RoleResolvable | UserResolvable, payload: PermissionOverwriteOptions) {
	await channel.permissionOverwrites.edit(userOrRole, payload);
}
