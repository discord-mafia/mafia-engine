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
			url = `According to all known laws of aviation, there is no way a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway because bees don't care what humans think is impossible. Yellow, black. Yellow, black. Yellow, black. Yellow, black. Ooh, black and yellow! Let's shake it up a little. Barry! Breakfast is ready! Coming! Hang on a second. Hello? Barry? Adam? Can you believe this is happening? I can't. I'll pick you up. Looking sharp. Use the stairs, Your father paid good money for those. Sorry. I'm excited. Here's the graduate. We're very proud of you, son. A perfect report card, all B's. Very proud. Ma! I got a thing going here. You got lint on your fuzz. Ow! That's me! Wave to us! We'll be in row 118,000. Bye! Barry, I told you, stop flying in the house! Hey, Adam. Hey, Barry. Is that fuzz gel? A little. Special day, graduation. Never thought I'd make it. Three days grade school, three days high school. Those were awkward. Three days college. I'm glad I took a day and hitchhiked around The Hive. You did come back different. Hi, Barry. Artie, growing a mustache? Looks good. Hear about Frankie? Yeah. You going to the funeral? No, I'm not going. Everybody knows, sting someone, you die. Don't waste it on a squirrel. Such a hothead. I guess he could have just gotten out of the way. I love this incorporating an amusement park into our day. That's why we don't need vacations. Boy, quite a bit of pomp under the circumstances. Well, Adam, today we are men. We are! Bee-men. Amen! Hallelujah! Students, faculty, distinguished bees, please welcome Dean Buzzwell. Welcome, New Hive City graduating class of 9:15. That concludes our ceremonies And begins your career at Honex Industries! Will we pick our job today? I heard it's just orientation. Heads up! Here we go. Keep your hands and antennas inside the tram at all times. Wonder what it'll be like? A little scary. Welcome to Honex, a division of Honesco and a part of the Hexagon Group. This is it! Wow. Wow. We know that you, as a bee, have worked your whole life to get to the point where you can work for your whole life. Honey begins when our valiant Pollen Jocks bring the nectar to The Hive. Our top-secret formula is automatically color-corrected, scent-adjusted and bubble-contoured into this soothing sweet syrup with its distinctive golden glow you know as... Honey! That girl was hot. She's my cousin! She is? Yes, we're all cousins. Right. You're right. At Honex, we constantly strive to improve every aspect of bee existence. These bees are stress-testing a new helmet technology. What do you think he makes? Not enough. Here we have our latest advancement, the Krelman. What does that do? Catches that little strand of honey that hangs after you pour it. Saves us millions. Can anyone work on the Krelman? Of course. Most bee jobs are small ones. But bees know that every small job, if it's done well, means a lot. But choose carefully because you'll stay in the job you pick for the rest of your life. The same job the rest of your life? I didn't know that. What's the difference? You'll be happy to know that bees, as a species, haven't had one day off in 27 million years. So you'll just work us to death? We'll sure try. Wow! That blew my mind! "What's the difference?" How can you say that? One job forever?`;
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
