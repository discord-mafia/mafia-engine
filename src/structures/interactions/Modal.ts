import { ModalBuilder, type ModalSubmitInteraction } from 'discord.js';
import { Interaction } from '../interactions';

export class Modal extends Interaction {
	public static modals: Map<string, Modal> = new Map();

	constructor(customID: string) {
		super(customID);
		if (Modal.modals.has(customID)) throw new Error(`Custom ID ${customID} already exists.`);
		Modal.modals.set(customID, this);
	}

	generateModal(data?: string): ModalBuilder {
		return new ModalBuilder().setCustomId(this.createCustomID(data)).setTitle('Example Modal');
	}

	async onExecute(_i: ModalSubmitInteraction, _cache?: string): Promise<unknown | void> {
		return undefined;
	}

	static getModalOrThrow(customId: string) {
		const modal = Modal.modals.get(customId);
		if (modal) return modal;
		else throw Error(`No modal with custom ID ${customId} was found.`);
	}
}
