import {
	type ChatInputCommandInteraction,
	type AutocompleteInteraction,
	SlashCommandSubcommandBuilder,
} from 'discord.js';
import { getOrInsertUser, User } from '../db/users';
import { handleInteractionError } from '../utils/errors';

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

export class SubCommand extends SlashCommandSubcommandBuilder {
	private executeFunction: SlashCommandExecute = defaultSlashCommandExecute;
	private autocompleteFunction?: SlashCommandAutocomplete;
	public name: string;
	constructor(name: string) {
		super();
		this.name = name;
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
			await handleInteractionError(err, inter);
		}
	}

	public async autocomplete(inter: AutocompleteInteraction) {
		if (!this.autocompleteFunction) return;
		try {
			await this.autocompleteFunction(inter);
		} catch (err) {
			console.log(err);
		}
	}
}
