import { Client, Events, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Interaction } from './interactions';
import OnClientReady from '../events/discordEvents/clientReady';
import OnInteraction from '../events/discordEvents/onInteraction';
import { ServerType, type SlashCommand, getSlashCommands } from './interactions/OldSlashCommand';
import { SlashCommand as NewSlashCommand } from './interactions/SlashCommand';

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

export class BotClient extends Client {
	public rest: REST;

	private discordToken: string;
	public clientID: string;

	public interactionsPath = path.join(__dirname, '..', 'events');

	constructor(clientID: string, discordToken: string, registerCallback: (client: BotClient) => void = () => {}) {
		super(DEFAULT_INTENTS);
		this.discordToken = discordToken;
		this.clientID = clientID;
		this.rest = new REST({ version: '10' }).setToken(this.discordToken);

		this.load().then(() => registerCallback(this));
	}

	private async load() {
		await this.assignEvents();
		await Interaction.loadInteractions(this.interactionsPath);
		await this.registerCommands();
	}

	private async assignEvents() {
		this.on(Events.ClientReady, OnClientReady);
		this.on(Events.InteractionCreate, OnInteraction);
		this.on(Events.Error, (err) => {
			console.error(err);
		});
	}

	public start = () => {
		if (!this.discordToken) return console.log('Discord Token was not supplied or is invalid');
		this.login(this.discordToken);
	};

	public async loadInteractions<T>(recursive: boolean = true) {
		const commandPath = path.join(this.interactionsPath);

		const loadFiles = async (dirPath: string) => {
			try {
				const files = fs.readdirSync(dirPath);
				for (const file of files) {
					const filePath = path.join(dirPath, file);
					const stats = fs.statSync(filePath);
					if (stats.isDirectory() && recursive) {
						await loadFiles(filePath); // Recursive call for subdirectories
					} else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
						try {
							// eslint-disable-next-line @typescript-eslint/no-var-requires
							require(filePath).default as T;
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
	}

	public async registerCommands() {
		try {
			const commandList: Record<ServerType, SlashCommand[]> = {
				MAIN: [],
				PLAYERCHAT: [],
				ALL: [],
				NONE: [],
				TURBO: [],
			};

			const newCommandList: NewSlashCommand[] = [];

			getSlashCommands().forEach((val) => {
				return commandList[ServerType.ALL].push(val);
			});

			NewSlashCommand.slashCommands.forEach((val) => {
				return newCommandList.push(val);
			});

			// Go through each and register them

			console.log(`\x1b[33mRegistering all application (/) commands...\x1b[0m`);
			const list: unknown[] = commandList.ALL.map((cmd) => {
				return cmd.data;
			});

			list.push(...newCommandList.map((cmd) => cmd.getBuilder()));

			const registeredCommands = (await this.rest.put(Routes.applicationCommands(this.clientID), {
				body: list,
			})) as unknown;

			if (Array.isArray(registeredCommands)) {
				if (registeredCommands.length != list.length) {
					console.log(`\x1B[31mFailed to load ${list.length - registeredCommands.length} commands`);
				}
			}
			console.log(`\x1b[32mSuccessfully registered [unknown] commands\x1b[0m`);
		} catch (err) {
			console.error(err);
		}
	}
}
