import { type Client } from 'discord.js';
import path from 'path';
import { Interaction } from '../../structures/interactions';

export default function ClientReady(client: Client<true>) {
	console.log(`Ready! Logged in as ${client.user.tag}`);

	// Load NEW interactions
	const basePath = path.join(__dirname, '..', '..', 'events');
	Interaction.loadInteractions(basePath);
}
