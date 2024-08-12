import { type Client } from 'discord.js';

export default function ClientReady(client: Client<true>) {
	console.log(`[BOT] Connected as ${client.user.tag}`);
}
