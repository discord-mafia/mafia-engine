import { BotClient } from './structures/BotClient';
import config from './config';
import { PrismaClient } from '@prisma/client';
import { Guild, Snowflake } from 'discord.js';
import { checkExpiredTurbos } from './clock/turbos';
import { runCycles } from './structures/turbos/games';
import { runExpressServer } from './router';

export const prisma = new PrismaClient();
export const client = new BotClient(config.DISCORD_CLIENT_ID, config.DISCORD_TOKEN, async (c) => {
	start(c);
});

const guilds = new Map<Snowflake, Guild>();
export async function getGuild(id: Snowflake) {
	if (guilds.has(id)) return guilds.get(id);
	const guild = await client.guilds.fetch(id);
	if (!guild) return null;
	guilds.set(id, guild);
	return guild;
}

async function start(c: BotClient) {
	c.start();

	const guild = await client.guilds.fetch(config.MAIN_SERVER_ID);
	if (!guild) return client.destroy();

	tick(client, guild);

	runExpressServer(() => {});
}

async function tick(client: BotClient, guild: Guild) {
	try {
		await checkExpiredTurbos(client);
	} catch (err) {}

	try {
		await runCycles();
	} catch (err) {}

	setTimeout(() => {
		tick(client, guild);
	}, config.TICK_INTERVAL ?? 1000);
}
