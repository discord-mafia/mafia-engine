import {
	ActivityType,
	Client,
	Events,
	GatewayIntentBits,
	Partials,
	REST,
	Routes,
	SlashCommandBuilder,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { SlashCommand } from '../builders/slashCommand';
import config from '../config';

import OnClientReady from '../events/clientReady';
import onInteraction from '../events/interactionCreate';
import { SubCommandHandler } from '../builders/subcommandHandler';
import axios from 'axios';

export const DEFAULT_INTENTS = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildPresences,
	],
	partials: [Partials.User],
};

export const client = new Client(DEFAULT_INTENTS);
const clientREST = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

export async function startDiscordBot() {
	client.on(Events.ClientReady, OnClientReady);
	client.on(Events.InteractionCreate, (i) => {
		onInteraction(i);
	});
	client.on(Events.Error, (err) => {
		console.log(err);
	});

	client.on(Events.MessageCreate, async (msg) => {
		if (
			msg.author.id != '416757703516356628' &&
			msg.author.id != '335149838616231937' &&
			msg.author.id != '689590113684291627' &&
			msg.author.id != '412634999020453891' &&
			msg.author.id != '691439078910066769'
		)
			return;
		if (msg.content.trim() != 'I like mashed potatoes.') return;
		if (!config.UNSPLASH_TOKEN) return;

		let url =
			'https://images.unsplash.com/photo-1590152684852-ae3ccec52ac6?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
		if (msg.author.id == '689590113684291627') {
			url =
				'https://i.imgur.com/D1n73wX.gif';
		} else if (msg.author.id == '412634999020453891') {
			url =
				'https://media1.tenor.com/m/saPUlEkMM9YAAAAd/noah-sebastian-bad-omens.gif';
		} else if (msg.author.id == '691439078910066769') {
			url = `The FitnessGram Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly but gets faster each minute after you hear this signal bodeboop. A sing lap should be completed every time you hear this sound. ding Remember to run in a straight line and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark. Get ready!… Start. ding﻿`;
		}

		await msg.channel.send({
			content: url,
			reply: { messageReference: msg.id },
		});
	});

	await loadInteractions();
	await client.login(config.DISCORD_TOKEN);
	client.user?.setActivity({
		name: 'Discord Mafia',
		url: 'https://discord.gg/social-deduction',
		type: ActivityType.Playing,
	});
	await registerCommands();
}

async function loadInteractions() {
	const interactionPath = path.join(__dirname, '..', 'interactions');
	const loadFiles = async (dirPath: string) => {
		try {
			const files = fs.readdirSync(dirPath);
			for (const file of files) {
				const filePath = path.join(dirPath, file);
				const stats = fs.statSync(filePath);
				if (stats.isDirectory()) {
					await loadFiles(filePath); // Recursive call for subdirectories
				} else if (
					stats.isFile() &&
					(file.endsWith('.ts') || file.endsWith('.js'))
				) {
					try {
						const _ = import(filePath);
					} catch (err) {
						console.log(
							`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`
						);
					}
				}
			}
		} catch (err) {
			console.log(
				`\x1B[31mFailed to load directory: \x1B[34m${interactionPath}\x1B[0m`
			);
		}
	};

	await loadFiles(interactionPath);
	console.log('[BOT] Loaded interactions');
}

export async function registerCommands() {
	try {
		const commandList: SlashCommandBuilder[] = [];
		SlashCommand.slashCommands.forEach((val) => {
			return commandList.push(val);
		});

		SubCommandHandler.subcommandHandlers.forEach((val) => {
			const tmp = val.build();
			if (tmp) return commandList.push(tmp);
		});

		const registeredCommands = (await clientREST.put(
			Routes.applicationCommands(config.DISCORD_CLIENT_ID),
			{
				body: commandList,
			}
		)) as unknown;

		if (Array.isArray(registeredCommands)) {
			if (registeredCommands.length != commandList.length) {
				console.log(
					`\x1B[31mFailed to load ${
						commandList.length - registeredCommands.length
					} commands`
				);
			}
		}

		console.log(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			`[BOT] Registered ${(registeredCommands as any).length}/${
				commandList.length
			} commands`
		);
	} catch (err) {
		console.error(err);
	}
}
