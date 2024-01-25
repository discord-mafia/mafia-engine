import { UserSelectMenuBuilder, type UserSelectMenuInteraction } from 'discord.js';
import { Interaction } from './_Interaction';

export type UserSelectMenuBuilderFunc = (builder: UserSelectMenuBuilder, data?: string) => UserSelectMenuBuilder;
export type OnUserSelectExecute = (i: UserSelectMenuInteraction, cache?: string) => Promise<unknown | void>;

export class CustomUserSelectMenuBuilder extends Interaction {
	public static userSelectMenus = new Map<string, CustomUserSelectMenuBuilder>();

	private builder?: UserSelectMenuBuilderFunc;
	public executeFunc?: OnUserSelectExecute;

	constructor(customID: string) {
		super(customID);
		if (CustomUserSelectMenuBuilder.userSelectMenus.has(customID)) throw new Error(`[USER SELECT] Custom ID ${customID} already exists.`);
		CustomUserSelectMenuBuilder.userSelectMenus.set(customID, this);
	}

	onGenerate(fn: UserSelectMenuBuilderFunc) {
		this.builder = fn;
		return this;
	}

	onExecute(fn: OnUserSelectExecute) {
		this.executeFunc = fn;
		return this;
	}

	build(data?: string) {
		const builder = new UserSelectMenuBuilder().setCustomId(this.createCustomID(data));
		if (!this.builder) return builder.setCustomId(`user-select-error-${this.customId}`);
		return this.builder(builder, data);
	}
}
