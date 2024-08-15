import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
} from 'discord.js';
import { getOrInsertUser, User } from '../db/users';

export type SlashCommandContext = {
	user: User;
};

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

export class SlashCommand extends SlashCommandBuilder {
	public static slashCommands = new Map<string, SlashCommand>();
	private executeFunction: SlashCommandExecute = defaultSlashCommandExecute;
	private autocompleteFunction?: SlashCommandAutocomplete;

	constructor(name: string) {
		super();
		if (SlashCommand.slashCommands.has(name))
			throw new Error(`Slash command ${name} already exists.`);
		SlashCommand.slashCommands.set(name, this);
		this.setName(name).setDescription('No description provided.');
	}

	public onExecute(executeFunction: SlashCommandExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public onAutocomplete(autocompleteFunction: SlashCommandAutocomplete) {
		this.autocompleteFunction = autocompleteFunction;
		return this;
	}

	public async run(inter: ChatInputCommandInteraction) {
		const user = await getOrInsertUser({
			id: inter.user.id,
			username: inter.user.username,
		});

		if (!user) {
			return await inter.reply({
				content:
					'An error occurred while executing this command. ERR_USER_NOT_FOUND',
				ephemeral: true,
			});
		}
		const ctx: SlashCommandContext = {
			user,
		};

		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			console.log(err);
			await inter.reply({
				content:
					'An error occurred while executing this command. ERR_GENERIC',
				ephemeral: true,
			});
		}
	}
}
