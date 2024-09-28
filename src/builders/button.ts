import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentEmojiResolvable,
} from 'discord.js';
import { handleInteractionError } from '../utils/errors';
import { CustomId } from '../utils/customId';

export type ButtonContext = string | undefined;

export type ButtonExecute = (
	i: ButtonInteraction,
	ctx: ButtonContext
) => unknown | Promise<unknown>;

const defaultButtonExecute: ButtonExecute = async (i, _ctx) => {
	await i.reply({
		content: 'This button has not been implemented yet.',
		ephemeral: true,
	});
};

export class Button {
	public static buttons = new Map<string, Button>();
	private builder: ButtonBuilder;
	private executeFunction: ButtonExecute = defaultButtonExecute;

	private staticCustomId: string;

	constructor(custom_id: string) {
		if (Button.buttons.has(custom_id))
			throw new Error(`Button ${custom_id} already exists.`);

		if (!CustomId.verifyRaw(custom_id))
			throw new Error(
				`Button ${custom_id} is not in the correct format.`
			);

		this.staticCustomId = custom_id;
		this.builder = new ButtonBuilder().setCustomId(custom_id);
		Button.buttons.set(custom_id, this);
	}

	public onExecute(executeFunction: ButtonExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public async run(inter: ButtonInteraction, ctx?: string) {
		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			await handleInteractionError(err, inter);
		}
	}

	public setStyle(style: ButtonStyle) {
		this.builder.setStyle(style);
		return this;
	}

	public setDisabled(disabled: boolean) {
		this.builder.setDisabled(disabled);
		return this;
	}

	public setEmoji(emoji: ComponentEmojiResolvable) {
		this.builder.setEmoji(emoji);
		return this;
	}

	public setURL(url: string) {
		this.builder.setURL(url);
		return this;
	}

	public setLabel(label: string) {
		this.builder.setLabel(label);
		return this;
	}

	public getCustomId() {
		return this.staticCustomId;
	}

	public build(customId?: string) {
		const newBuilder = this.builder;
		if (customId) newBuilder.setCustomId(customId);
		return newBuilder;
	}

	public buildWithContext(ctx: string) {
		const newCustomId = new CustomId(this.getCustomId(), ctx);
		return this.build(newCustomId.getHydrated());
	}

	public buildAsRow(customId?: string) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			this.build(customId)
		);
	}
}
