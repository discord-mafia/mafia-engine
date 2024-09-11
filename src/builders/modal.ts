import { ModalBuilder, ModalSubmitInteraction } from 'discord.js';
import { verifyCustomId } from '../utils/customId';
import { handleInteractionError } from '../utils/errors';

export type ModalContext = string | undefined;

export type ModalExecute = (
	i: ModalSubmitInteraction,
	ctx: ModalContext
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

	constructor(custom_id: string) {
		super();
		if (Modal.modals.has(custom_id))
			throw new Error(`Modal ${custom_id} already exists.`);
		if (!verifyCustomId(custom_id))
			throw new Error(`Modal ${custom_id} is not in the correct format.`);
		this.setCustomId(custom_id);
		Modal.modals.set(custom_id, this);
	}

	public onExecute(executeFunction: ModalExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public async run(inter: ModalSubmitInteraction, ctx?: string) {
		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			await handleInteractionError(err, inter);
		}
	}
}
