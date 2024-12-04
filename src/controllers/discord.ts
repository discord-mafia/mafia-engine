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
				'https://media1.tenor.com/m/GJ2PsnsAmCMAAAAd/elmo-burning.gif';
		} else if (msg.author.id == '412634999020453891') {
			url =
				'https://media1.tenor.com/m/saPUlEkMM9YAAAAd/noah-sebastian-bad-omens.gif';
		} else if (msg.author.id == '691439078910066769') {
			url = `NARRATOR:
(Black screen with text; The sound of buzzing bees can be heard)
According to all known laws
of aviation,
 :
there is no way a bee
should be able to fly.
 :
Its wings are too small to get
its fat little body off the ground.
 :
The bee, of course, flies anyway
 :
because bees don't care
what humans think is impossible.
BARRY BENSON:
(Barry is picking out a shirt)
Yellow, black. Yellow, black.
Yellow, black. Yellow, black.
 :
Ooh, black and yellow!
Let's shake it up a little.
JANET BENSON:
Barry! Breakfast is ready!
BARRY:
Coming!
 :
Hang on a second.
(Barry uses his antenna like a phone)
 :
Hello?
ADAM FLAYMAN:

(Through phone)
- Barry?
BARRY:
- Adam?
ADAM:
- Can you believe this is happening?
BARRY:
- I can't. I'll pick you up.
(Barry flies down the stairs)
 :
MARTIN BENSON:
Looking sharp.
JANET:
Use the stairs. Your father
paid good money for those.
BARRY:
Sorry. I'm excited.
MARTIN:
Here's the graduate.
We're very proud of you, son.
 :
A perfect report card, all B's.
JANET:
Very proud.
(Rubs Barry's hair)
BARRY=
Ma! I got a thing going here.
JANET:
- You got lint on your fuzz.
BARRY:
- Ow! That's me!

JANET:
- Wave to us! We'll be in row 118,000.
- Bye!
(Barry flies out the door)
JANET:
Barry, I told you,
stop flying in the house!
(Barry drives through the hive,and is waved at by Adam who is reading a
newspaper)
BARRY==
- Hey, Adam.
ADAM:
- Hey, Barry.
(Adam gets in Barry's car)
 :
- Is that fuzz gel?
BARRY:
- A little. Special day, graduation.
ADAM:
Never thought I'd make it.
(Barry pulls away from the house and continues driving)
BARRY:
Three days grade school,
three days high school...
ADAM:
Those were awkward.
BARRY:
Three days college. I'm glad I took
a day and hitchhiked around the hive.
ADAM==
You did come back different.
(Barry and Adam pass by Artie, who is jogging)
ARTIE:
- Hi, Barry!`;
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
