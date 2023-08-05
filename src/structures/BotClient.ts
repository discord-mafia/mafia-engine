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
			const commandList: Record<ServerType, any[]> = {
				MAIN: [],
				PLAYERCHAT: [],
				ALL: [],
				NONE: [],
				TURBO: [],
			};

			slashCommands.forEach((val) => {
				if (!val.serverType) return commandList[ServerType.ALL].push(val.data);
				else if (Array.isArray(val.serverType)) {
					val.serverType.forEach((type) => {
						commandList[type].push(val.data);
					});
				} else if (val.serverType) {
					commandList[val.serverType].push(val.data);
				} else {
					commandList[ServerType.NONE].push(val.data);
				}
			});

			const allServers = (await this.rest.put(Routes.applicationCommands(this.clientID), { body: commandList['ALL'] })) as any;
			console.log(`[ALL] Successfully reloaded ${allServers.length} application (/) commands.`);

			const mainServer = (await this.rest.put(Routes.applicationGuildCommands(this.clientID, config.MAIN_SERVER_ID), {
				body: commandList['MAIN'],
			})) as any;
			console.log(`[MAIN] Successfully reloaded ${mainServer.length} application (/) commands.`);

			const playerChatServer = (await this.rest.put(Routes.applicationGuildCommands(this.clientID, config.PLAYERCHAT_SERVER_ID), {
				body: commandList['PLAYERCHAT'],
			})) as any;
			console.log(`[PLAYERCHAT] Successfully reloaded ${playerChatServer.length} application (/) commands.`);

			const turboServer = (await this.rest.put(Routes.applicationGuildCommands(this.clientID, config.TURBO_SERVER_ID), {
				body: commandList['TURBO'],
			})) as any;
			console.log(`[TURBO] Successfully reloaded ${turboServer.length} application (/) commands.`);

			console.log(`[NONE] ${commandList['NONE'].length} commands force-skipped`);
		} catch (err) {
			console.error(err);
		}
	}
}
