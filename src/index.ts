import { BotClient } from './structures/BotClient';
import { PrismaClient } from '@prisma/client';
import config from './config';
import { type Guild } from 'discord.js';
import { startServer } from './api';
import { autoLockLoop } from '@controllers/autolockController';

export const prisma = new PrismaClient();
export const client = new BotClient(config.DISCORD_CLIENT_ID, config.DISCORD_TOKEN, async (c) => {
	start(c);
	startServer();
});

async function start(c: BotClient) {
	c.start();

	const guild = await client.guilds.fetch(config.MAIN_SERVER_ID);
	if (!guild) return client.destroy();

	tick(client, guild);
	autoLockLoop();
}

async function tick(client: BotClient, guild: Guild) {
	setTimeout(() => {
		tick(client, guild);
	}, config.TICK_INTERVAL ?? 1000);
}
