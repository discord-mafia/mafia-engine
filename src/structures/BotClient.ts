import {
	CacheType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Guild,
	Partials,
	REST,
	Routes,
	SlashCommandBuilder,
} from 'discord.js';
import * as path from 'path';
import * as fs from 'fs';
import { Button, Event, Modal, SelectMenu } from './interactions';
import OnClientReady from '../interactions/events/clientReady';
import OnInteraction from '../interactions/events/onInteraction';
import { ContextMenuCommandBuilder } from 'discord.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Extension } from '../util/types';
import config from '../config';

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

export const slashCommands: Collection<string, SlashCommand> = new Collection();
export enum ServerType {
	MAIN = 'MAIN',
	PLAYERCHAT = 'PLAYERCHAT',
	TURBO = 'TURBO',
	ALL = 'ALL',
	NONE = 'NONE',
}
export interface SlashCommand {
	data: SlashCommandBuilder;
	serverType?: ServerType | ServerType[];
	execute: (i: ChatInputCommandInteraction) => any | Promise<any>;
}

export async function newSlashCommand(cmd: SlashCommand) {
	try {
		slashCommands.set(cmd.data.name, cmd);
		console.log(`Loaded [${cmd.data.name}]`);
		return cmd;
	} catch (err) {
		console.error(`Failed to load [${cmd.data.name}]`);
	}
}

export class BotClient extends Client {
	public rest: REST;

	private discordToken: string;
	public clientID: string;

	public interactionsPath = path.join(__dirname, '..', 'interactions');

	constructor(clientID: string, discordToken: string, registerCallback: (client: BotClient) => void = (c) => {}) {
		super(DEFAULT_INTENTS);
		this.discordToken = discordToken;
		this.clientID = clientID;
		this.rest = new REST({ version: '10' }).setToken(this.discordToken);

		this.loadInteractions<Event>('events');
		this.loadInteractions<SlashCommand>('commands');
		this.loadInteractions<Button>('buttons');
		this.loadInteractions<SelectMenu>('selectmenu');
		this.loadInteractions<Modal>('modals');
		this.loadInteractions<ContextMenuCommandBuilder>('context');

		this.assignEvents();
		this.registerCommands().then(() => registerCallback(this));
	}

	private async assignEvents() {
		this.on(Events.ClientReady, OnClientReady);
		this.on(Events.InteractionCreate, OnInteraction);
	}

	public start = () => {
		if (!this.discordToken) return console.log('Discord Token was not supplied or is invalid');
		this.login(this.discordToken);
	};

	public async loadInteractions<T>(newPath: string) {
		const commandPath = path.join(this.interactionsPath, newPath);
		try {
			const files = fs.readdirSync(commandPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
			for (const file of files) {
				try {
					const filePath = path.join(commandPath, file);
					require(filePath).default as T;
				} catch (err) {
					console.log(`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`);

					console.error(err);
				}
			}
		} catch (err) {
			console.log(`\x1B[31mFailed to load directory: \x1B[34m${newPath}\x1B[0m`);
		}
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

			slashCommands.forEach((val) => {
				return commandList[ServerType.ALL].push(val);
				// else if (Array.isArray(val.serverType)) {
				// 	val.serverType.forEach((type) => {
				// 		commandList[type].push(val);
				// 	});
				// } else if (val.serverType) {
				// 	commandList[val.serverType].push(val);
				// } else {
				// 	commandList[ServerType.NONE].push(val);
				// }
			});

			// Go through each and register them

			console.log(`\x1b[33mRegistering all application (/) commands...\x1b[0m`);
			const list: any[] = commandList.ALL.map((cmd) => {
				return cmd.data;
			});

			const registeredCommands = (await this.rest.put(Routes.applicationGuildCommands(this.clientID, '648663810772697089'), {
				body: list,
			})) as any;
			if (registeredCommands.length != list.length) {
				console.log(`\x1B[31mFailed to load ${list.length - registeredCommands.length} commands`);
			}
		} catch (err) {
			console.error(err);
		}
	}
}
