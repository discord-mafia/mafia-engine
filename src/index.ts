import { BotClient } from './structures/BotClient';
import { PrismaClient } from '@prisma/client';
import config from './config';
import { checkExpiredTurbos } from './clock/turbos';
import { type Guild } from 'discord.js';
import { runCycles } from './structures/turbos/games';

export const prisma = new PrismaClient();
export const client = new BotClient(config.DISCORD_CLIENT_ID, config.DISCORD_TOKEN, async (c) => {
	start(c);
});

async function start(c: BotClient) {
	c.start();

	const guild = await client.guilds.fetch(config.MAIN_SERVER_ID);
	if (!guild) return client.destroy();

	tick(client, guild);
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
