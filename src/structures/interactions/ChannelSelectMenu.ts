import { ChannelSelectMenuBuilder, ChannelSelectMenuInteraction } from 'discord.js';
import { Interaction } from './_Interaction';

export type ChannelSelectMenuBuilderFunc = (builder: ChannelSelectMenuBuilder, data?: string) => ChannelSelectMenuBuilder;
export type OnChannelSelectExecute = (i: ChannelSelectMenuInteraction, cache?: string) => Promise<unknown | void>;

export class CustomChannelSelectMenu extends Interaction {
	public static selectMenus = new Map<string, CustomChannelSelectMenu>();

	private builder?: ChannelSelectMenuBuilderFunc;
	public executeFunc?: OnChannelSelectExecute;

	constructor(customID: string) {
		super(customID);
		if (CustomChannelSelectMenu.selectMenus.has(customID)) throw new Error(`[CHANNEL SELECT] Custom ID ${customID} already exists.`);
		CustomChannelSelectMenu.selectMenus.set(customID, this);
	}

	onGenerate(fn: ChannelSelectMenuBuilderFunc) {
		this.builder = fn;
		return this;
	}

	onExecute(fn: OnChannelSelectExecute) {
		this.executeFunc = fn;
		return this;
	}

	build(data?: string) {
		const builder = new ChannelSelectMenuBuilder().setCustomId(this.createCustomID(data));
		if (!this.builder) return builder.setCustomId(`channel-select-error-${this.customId}`);
		return this.builder(builder, data);
	}
}
