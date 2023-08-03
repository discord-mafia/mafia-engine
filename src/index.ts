import { BotClient } from './structures/BotClient';
import config from './config';
import { PrismaClient } from '@prisma/client';
import { Guild } from 'discord.js';

export const prisma = new PrismaClient();
export const client = new BotClient(config.DISCORD_CLIENT_ID, config.DISCORD_TOKEN);

(async () => {
	client.start();

	const guild = await client.guilds.fetch(config.MAIN_SERVER_ID);
	if (!guild) return client.destroy();

	tick(client, guild);
})();

async function tick(client: BotClient, guild: Guild) {
	setTimeout(() => {
		tick(client, guild);
	}, config.TICK_INTERVAL ?? 1000);
}
