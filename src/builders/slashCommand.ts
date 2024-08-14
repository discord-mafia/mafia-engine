import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
} from 'discord.js';
import { unknown } from 'zod';

export type SlashCommandContext = unknown;

export type SlashCommandExecute = (
	i: ChatInputCommandInteraction,
	ctx: SlashCommandContext
) => unknown | Promise<unknown>;
const defaultSlashCommandExecute: SlashCommandExecute = async (i, _ctx) => {
	await i.reply({
		content: 'This slash command has not been implemented yet.',
		ephemeral: true,
	});
};

export type SlashCommandAutocomplete = (
	i: AutocompleteInteraction
) => unknown | Promise<unknown>;

export class SlashCommand {
	public static slashCommands = new Map<string, SlashCommand>();
	private builder: SlashCommandBuilder;
	private executeFunction: SlashCommandExecute = defaultSlashCommandExecute;
	private commandName: string;

	constructor(name: string) {
		if (SlashCommand.slashCommands.has(name))
			throw new Error(`Slash command ${name} already exists.`);
		this.commandName = name;
		SlashCommand.slashCommands.set(name, this);
		this.builder = new SlashCommandBuilder()
			.setName(name)
			.setDescription('No description provided.');
	}

	public setDescription(description: string) {
		this.builder.setDescription(description);
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

	public async run(inter: ChatInputCommandInteraction) {
		const ctx: SlashCommandContext = unknown;

		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			console.log(err);
			await inter.reply({
				content: 'An error occurred while executing this command.',
				ephemeral: true,
			});
		}
	}

	public getBuilder() {
		return this.builder;
	}
}
