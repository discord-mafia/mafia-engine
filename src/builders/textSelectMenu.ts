import {
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js';
import { verifyCustomId } from '../utils/customId';
import { handleInteractionError } from '../utils/errors';

export type TextSelectMenuContext = string | undefined;

export type TextSelectMenuExecute = (
	i: StringSelectMenuInteraction,
	ctx: TextSelectMenuContext
) => unknown | Promise<unknown>;

const defaultTextSelectMenuExecute: TextSelectMenuExecute = async (i, _ctx) => {
	await i.reply({
		content: 'This text select menu has not been implemented yet.',
		ephemeral: true,
	});
};

export class TextSelectMenu extends StringSelectMenuBuilder {
	public static textSelectMenus = new Map<string, TextSelectMenu>();
	private executeFunction: TextSelectMenuExecute =
		defaultTextSelectMenuExecute;

	constructor(custom_id: string) {
		super();
		if (TextSelectMenu.textSelectMenus.has(custom_id))
			throw new Error(`Text select menu ${custom_id} already exists.`);

		if (!verifyCustomId(custom_id))
			throw new Error(
				`Text select menu ${custom_id} is not in the correct format.`
			);

		this.setCustomId(custom_id);
		TextSelectMenu.textSelectMenus.set(custom_id, this);
	}

	public onExecute(executeFunction: TextSelectMenuExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public async run(inter: StringSelectMenuInteraction, ctx?: string) {
		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			await handleInteractionError(err, inter);
		}
	}

	public build(customId?: string) {
		const newBuilder = new StringSelectMenuBuilder(this.data);
		if (customId) newBuilder.setCustomId(customId);
		return newBuilder;
	}
}
