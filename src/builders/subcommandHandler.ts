import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { SubCommand } from './subcommand';
import { InteractionError } from '../utils/errors';

export class SubCommandHandler extends SlashCommandBuilder {
	public static subcommandHandlers = new Map<string, SubCommandHandler>();
	private subcommands = new Map<string, SubCommand>();
	constructor(name: string) {
		super();
		if (SubCommandHandler.subcommandHandlers.has(name))
			throw new Error(`Subcommand Handler ${name} already exists.`);
		this.setName(name).setDescription('No description provided.');
		SubCommandHandler.subcommandHandlers.set(name, this);
	}

	public attachSubcommand(subcommand: SubCommand) {
		if (!subcommand) return this;
		this.subcommands.set(subcommand.toJSON().name, subcommand);
		return this;
	}

	public async run(inter: ChatInputCommandInteraction) {
		const subcommandHandle = inter.options.getSubcommand();
		if (!subcommandHandle)
			throw new InteractionError('No subcommand provided');

		const subcommand = this.subcommands.get(subcommandHandle);
		if (!subcommand)
			throw new InteractionError('Invalid subcommand provided');

		await subcommand.run(inter);
	}

	public build() {
		const builder = this.setName(this.name);
		for (const subcommand of this.subcommands.values()) {
			builder.addSubcommand(subcommand);
		}
		return builder;
	}
}
