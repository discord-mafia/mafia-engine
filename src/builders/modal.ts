import {
	ActionRowBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
} from 'discord.js';
import { handleInteractionError } from '../utils/errors';
import { TextInputBuilder } from '@discordjs/builders';
import { CustomId } from '../utils/customId';

export type ModalExecute = (
	i: ModalSubmitInteraction,
	ctx?: string
) => unknown | Promise<unknown>;

const defaultModalExecute: ModalExecute = async (i, _ctx) => {
	await i.reply({
		content: 'This modal has not been implemented yet.',
		ephemeral: true,
	});
};

export class Modal extends ModalBuilder {
	public static modals = new Map<string, Modal>();
	private executeFunction: ModalExecute = defaultModalExecute;
	public customId: string;
	private inputs: TextInputBuilder[] = [];

	constructor(custom_id: string) {
		super();
		this.customId = custom_id;
		if (Modal.modals.has(custom_id))
			throw new Error(`Modal ${custom_id} already exists.`);
		if (!CustomId.verifyRaw(custom_id))
			throw new Error(`Modal ${custom_id} is not in the correct format.`);
		this.setCustomId(custom_id);
		Modal.modals.set(custom_id, this);
	}

	public onExecute(executeFunction: ModalExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public set(...inputs: TextInputBuilder[]) {
		this.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(...inputs)
		);
		this.inputs = inputs;
		return this;
	}

	public async run(inter: ModalSubmitInteraction, ctx?: string) {
		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			await handleInteractionError(err, inter);
		}
	}

	public build(customId?: string) {
		const modal = new ModalBuilder(this.data);
		const rows: ActionRowBuilder<TextInputBuilder>[] = this.inputs.map(
			(input) =>
				new ActionRowBuilder<TextInputBuilder>().addComponents(input)
		);
		modal.setComponents(rows);
		if (customId) modal.setCustomId(customId);
		return modal;
	}
}
