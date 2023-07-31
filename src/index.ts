import { BotClient } from './structures/BotClient';
import config from './config';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const client = new BotClient(config.DISCORD_CLIENT_ID, config.DISCORD_TOKEN);

(async () => {
	client.start();
	tick(client);
})();

async function tick(client: BotClient) {
	setTimeout(() => {
		tick(client);
	}, config.TICK_INTERVAL ?? 1000);
}
