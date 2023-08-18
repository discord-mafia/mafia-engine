import { Guild, GuildMember, Role } from 'discord.js';

type AllWithRole = {
	role: Role;
	members: GuildMember[];
};
export async function getAllWithRole(guild: Guild, roleID: string): Promise<AllWithRole | null> {
	await guild.roles.fetch();
	await guild.members.fetch();

	const role = guild.roles.cache.get(roleID);
	if (!role) return null;

	const result: GuildMember[] = [];
	const users = guild.members.cache.filter((m) => m.roles.cache.get(roleID));
	users.forEach((v) => result.push(v));

	return {
		role,
		members: result,
	};
}
