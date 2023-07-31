import { Client } from 'discord.js';

export default function ClientReady(client: Client<true>) {
	console.log(`Ready! Logged in as ${client.user.tag}`);
}
