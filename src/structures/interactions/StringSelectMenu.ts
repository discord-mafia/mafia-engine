import { StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { Interaction } from './_Interaction';

export type StringSelectMenuBuilderFunc = (builder: StringSelectMenuBuilder, data?: string) => StringSelectMenuBuilder;
export type OnStringSelectExecute = (i: StringSelectMenuInteraction, cache?: string) => Promise<unknown | void>;

export class CustomStringSelectMenu extends Interaction {
	public static selectMenus = new Map<string, CustomStringSelectMenu>();

	private builder?: StringSelectMenuBuilderFunc;
	public executeFunc?: OnStringSelectExecute;

	constructor(customID: string) {
		super(customID);
		if (CustomStringSelectMenu.selectMenus.has(customID)) throw new Error(`[STRING SELECT] Custom ID ${customID} already exists.`);
		CustomStringSelectMenu.selectMenus.set(customID, this);
	}

	onGenerate(fn: StringSelectMenuBuilderFunc) {
		this.builder = fn;
		return this;
	}

	onExecute(fn: OnStringSelectExecute) {
		this.executeFunc = fn;
		return this;
	}

	build(data?: string) {
		const builder = new StringSelectMenuBuilder().setCustomId(this.createCustomID(data));
		if (!this.builder) return builder.setCustomId(`string-select-error-${this.customId}`);
		return this.builder(builder, data);
	}
}
