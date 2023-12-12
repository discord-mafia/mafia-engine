import { type Guild, type GuildMember, type Role } from 'discord.js';

type AllWithRole = {
	role: Role;
	members: GuildMember[];
};
export async function getMembersWithDiscordRole(guild: Guild, roleID: string): Promise<AllWithRole | null> {
	const role = await guild.roles.fetch(roleID);
	if (!role) return null;

	const result: GuildMember[] = [];
	role.members.forEach((v) => result.push(v));

	return {
		role,
		members: result,
	};
}
