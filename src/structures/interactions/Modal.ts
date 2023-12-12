import { ModalBuilder, type ModalSubmitInteraction } from 'discord.js';
import { Interaction } from './_Interaction';

type ModalExecute = (i: ModalSubmitInteraction, cache?: string) => unknown | Promise<unknown>;
const defaultModalExecute: ModalExecute = async (i, _cache) => {
	await i.reply({ content: 'This modal has not been implemented yet.', ephemeral: true });
};

export class Modal extends Interaction {
	public static modals: Map<string, Modal> = new Map();
	private executeFunction: ModalExecute = defaultModalExecute;
	private setBuilder: (builder: ModalBuilder) => void = () => {};

	constructor(customID: string) {
		super(customID);
		if (Modal.modals.has(customID)) throw new Error(`Custom ID ${customID} already exists.`);
		Modal.modals.set(customID, this);
	}

	public set(setBuilder: (builder: ModalBuilder) => void) {
		this.setBuilder = setBuilder;
		return this;
	}

	public getModalBuilder() {
		const builder = new ModalBuilder().setCustomId(this.getCustomID());
		this.setBuilder(builder);
		return builder;
	}

	public onExecute(executeFunction: ModalExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public run(i: ModalSubmitInteraction, cache?: string) {
		return this.executeFunction(i, cache);
	}
}
