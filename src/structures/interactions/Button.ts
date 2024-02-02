import { ButtonBuilder as TrueButtonBuilder, type ButtonInteraction, ButtonStyle } from 'discord.js';
import { Interaction } from './_Interaction';

export type ButtonBuilderFunc = (builder: TrueButtonBuilder, data?: string) => TrueButtonBuilder;
export type OnButtonExecute = (i: ButtonInteraction, cache?: string) => Promise<unknown | void>;
export class CustomButtonBuilder extends Interaction {
	public static buttons: Map<string, CustomButtonBuilder> = new Map();

	private builder?: ButtonBuilderFunc;
	public executeFunc?: OnButtonExecute;
	constructor(customID: string) {
		super(customID);
		if (CustomButtonBuilder.buttons.has(customID)) throw new Error(`[BUTTON] Custom ID ${customID} already exists.`);
		CustomButtonBuilder.buttons.set(customID, this);
	}

	onGenerate(fn: ButtonBuilderFunc) {
		this.builder = fn;
		return this;
	}

	onExecute(fn: OnButtonExecute) {
		this.executeFunc = fn;
		return this;
	}

	build(data?: string) {
		const buttonBuilder = new TrueButtonBuilder().setCustomId(this.createCustomID(data)).setStyle(ButtonStyle.Secondary);
		if (!this.builder) return buttonBuilder.setCustomId(`button-error-${this.customId}`);
		return this.builder(buttonBuilder, data);
	}

	static getButtonOrThrow(customID: string) {
		const button = this.buttons.get(customID);
		if (!button) throw Error('Button does not exist with ID ' + customID);
		return button;
	}
}
