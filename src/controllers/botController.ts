import config from '@root/config';
import { Client, Events, GatewayIntentBits, Partials, REST, Routes, type SlashCommandBuilder } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import OnClientReady from '../events/discordEvents/clientReady';
import onInteraction from '@root/events/discordEvents/onInteraction';
import OnMessageCreate from '@root/events/discordEvents/onMessageCreate';

export const DEFAULT_INTENTS = {
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildPresences],
	partials: [Partials.User],
};

export const client = new Client(DEFAULT_INTENTS);
const clientREST = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

export async function loadInteractions() {
	const commandPath = path.join(__dirname, '..', 'events');
	const loadFiles = async (dirPath: string) => {
		try {
			const files = fs.readdirSync(dirPath);
			for (const file of files) {
				const filePath = path.join(dirPath, file);
				const stats = fs.statSync(filePath);
				if (stats.isDirectory()) {
					await loadFiles(filePath); // Recursive call for subdirectories
				} else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
					try {
						// eslint-disable-next-line @typescript-eslint/no-var-requires
						require(filePath).default;
					} catch (err) {
						console.log(`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`);
						console.error(err);
					}
				}
			}
		} catch (err) {
			console.log(`\x1B[31mFailed to load directory: \x1B[34m${commandPath}\x1B[0m`);
		}
	};

	await loadFiles(commandPath);
	console.log('[BOT] Loaded interactions');
}

export async function registerCommands() {
	try {
		const commandList: SlashCommandBuilder[] = [];
		SlashCommand.slashCommands.forEach((val) => {
			return commandList.push(val.getBuilder());
		});

		const registeredCommands = (await clientREST.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
			body: commandList,
		})) as unknown;

		if (Array.isArray(registeredCommands)) {
			if (registeredCommands.length != commandList.length) {
				console.log(`\x1B[31mFailed to load ${commandList.length - registeredCommands.length} commands`);
			}
		}

		console.log('[BOT] Registered commands');
	} catch (err) {
		console.error(err);
	}
}

export async function startDiscordBot() {
	client.on(Events.ClientReady, OnClientReady);
	client.on(Events.InteractionCreate, (i) => {
		onInteraction(i);
	});
	client.on(Events.MessageCreate, OnMessageCreate);
	client.on(Events.Error, (err) => {
		console.log(err);
	});

	await loadInteractions();
	await client.login(config.DISCORD_TOKEN);
	await registerCommands();
}

export async function getGuilds(ignoreCache: boolean = true) {
	if (ignoreCache) await client.guilds.fetch();
	return client.guilds.cache;
}
