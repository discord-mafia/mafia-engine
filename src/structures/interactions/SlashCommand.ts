import { SlashCommandBuilder, type ChatInputCommandInteraction, type AutocompleteInteraction } from 'discord.js';
import { LogType, Logger } from '@utils/logger';
import { type User, getUserById } from '@models/users';

export type Unauthorized = {
	citizenship: null;
};
export type Authorized = {
	citizenship: User;
};

export type SlashCommandContext = {
	logger: Logger;
} & (Unauthorized | Authorized);

export type SlashCommandExecute = (i: ChatInputCommandInteraction, ctx: SlashCommandContext) => unknown | Promise<unknown>;
const defaultSlashCommandExecute: SlashCommandExecute = async (i, _ctx) => {
	await i.reply({ content: 'This slash command has not been implemented yet.', ephemeral: true });
};

export type SlashCommandAutocomplete = (i: AutocompleteInteraction) => unknown | Promise<unknown>;

export class SlashCommand {
	public static slashCommands = new Map<string, SlashCommand>();
	private builder: SlashCommandBuilder;
	private executeFunction: SlashCommandExecute = defaultSlashCommandExecute;
	private executeAutoComplete: SlashCommandAutocomplete | undefined;
	private requiresCitizenship: boolean = false;

	constructor(name: string) {
		if (SlashCommand.slashCommands.has(name)) throw new Error(`Slash command ${name} already exists.`);
		SlashCommand.slashCommands.set(name, this);
		this.builder = new SlashCommandBuilder().setName(name).setDescription('No description provided.');

		console.log(`Created slash command ${name}`);
	}

	public setDescription(description: string) {
		this.builder.setDescription(description);
		return this;
	}

	public setRequiresCitizenship(requiresCitizenship: boolean = true) {
		this.requiresCitizenship = requiresCitizenship;
		return this;
	}

	public set(setBuilder: (builder: SlashCommandBuilder) => void) {
		setBuilder(this.builder);
		return this;
	}

	public onExecute(executeFunction: SlashCommandExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public onAutoComplete(autocompleteFunction: SlashCommandAutocomplete) {
		this.executeAutoComplete = autocompleteFunction;
		return this;
	}

	public async run(inter: ChatInputCommandInteraction) {
		const logger = new Logger();
		const user = await getUserById(inter.user.id);

		if (!user && this.requiresCitizenship) {
			// SHOW MODAL?
		}

		const ctx: SlashCommandContext = {
			logger,
			citizenship: user,
		};

		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			logger.log(LogType.Error, `Failed to run slash command ${this.builder.name}`);
			console.log(err);
			await inter.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
		}
	}

	public async runAutoComplete(i: AutocompleteInteraction) {
		if (!this.executeAutoComplete) return;
		try {
			await this.executeAutoComplete(i);
		} catch (err) {
			await i.respond([]);
		}
	}

	public getBuilder() {
		return this.builder;
	}
}
