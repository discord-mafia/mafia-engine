import { ButtonBuilder, type ButtonInteraction, ButtonStyle } from 'discord.js';
import { Interaction } from '../interactions';

export class CustomButton extends Interaction {
	public static buttons: Map<string, CustomButton> = new Map();

	constructor(customID: string) {
		super(customID);
		if (CustomButton.buttons.has(customID)) throw new Error(`Custom ID ${customID} already exists.`);
		CustomButton.buttons.set(customID, this);
	}

	generateButton(data?: string): ButtonBuilder {
		return new ButtonBuilder().setCustomId(this.createCustomID(data)).setLabel('Example Button').setStyle(ButtonStyle.Secondary);
	}

	async onExecute(_i: ButtonInteraction, _cache?: string): Promise<unknown | void> {
		return undefined;
	}

	static getButtonOrThrow(customId: string) {
		const button = CustomButton.buttons.get(customId);
		if (button) return button;
		else throw Error(`No button with custom ID ${customId} was found.`);
	}
}
