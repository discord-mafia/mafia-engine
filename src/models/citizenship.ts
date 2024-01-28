import { type Snowflake } from 'discord.js';
import { prisma } from 'index';

type NameQuery = { name: string };
type DiscordIdQuery = { discordId: Snowflake };
type CitizenshipQuery = NameQuery | DiscordIdQuery;

export async function getCitizenship(query: CitizenshipQuery) {
	try {
		if ('name' in query) {
			const citizen = await prisma.user.findUnique({
				where: {
					username: query.name,
				},
			});
			return citizen;
		} else if ('discordId' in query) {
			const citizen = await prisma.user.findUnique({
				where: {
					discordId: query.discordId,
				},
			});
			return citizen;
		}
		return null;
	} catch (err) {
		return null;
	}
}
