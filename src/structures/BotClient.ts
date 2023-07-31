import {
	CacheType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	Guild,
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

export const DEFAULT_INTENTS = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildIntegrations,
	],
};

export const slashCommands: Collection<string, SlashCommand> = new Collection();
export interface SlashCommand {
	data: SlashCommandBuilder;
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

	constructor(clientID: string, discordToken: string) {
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
		this.registerCommands();
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
					console.error(`Failed trying to load ${file}`);
					console.error(err);
				}
			}
		} catch (err) {
			console.log(`Failed to load ${newPath}`);
		}
	}

	public async registerCommands() {
		try {
			const list: any[] = [];
			slashCommands.forEach((val) => {
				list.push(val.data.toJSON());
			});

			const raw = await this.rest.put(Routes.applicationCommands(this.clientID), { body: list });
			const data = raw as any;
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (err) {
			console.error(err);
		}
	}
}
