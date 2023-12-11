import { type UnknownResponse } from '@root/types/response';
import { Collection, type SlashCommandBuilder, type ChatInputCommandInteraction, type AutocompleteInteraction, type Guild } from 'discord.js';

const slashCommands: Collection<string, SlashCommand> = new Collection();

export function getSlashCommand(name: string) {
	return slashCommands.get(name);
}

export function getSlashCommands() {
	return slashCommands;
}

export enum ServerType {
	MAIN = 'MAIN',
	PLAYERCHAT = 'PLAYERCHAT',
	TURBO = 'TURBO',
	ALL = 'ALL',
	NONE = 'NONE',
}

export interface SlashCommandInteraction extends ChatInputCommandInteraction {
	guild: Guild;
}

export interface SlashCommand {
	data: SlashCommandBuilder;
	serverType?: ServerType | ServerType[];
	execute: (i: ChatInputCommandInteraction) => UnknownResponse;
	autocomplete?: (i: AutocompleteInteraction) => void | Promise<void>;
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
