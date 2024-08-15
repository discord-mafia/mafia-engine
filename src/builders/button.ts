import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ComponentEmojiResolvable,
} from 'discord.js';
import { verifyCustomId } from '../utils/customId';

export type ButtonContext = unknown;

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
	private custom_id: string;

	constructor(custom_id: string) {
		if (Button.buttons.has(custom_id))
			throw new Error(`Button ${custom_id} already exists.`);

		if (!verifyCustomId(custom_id))
			throw new Error(
				`Button ${custom_id} is not in the correct format.`
			);

		this.custom_id = custom_id;
		this.builder = new ButtonBuilder()
			.setCustomId(custom_id)
			.setLabel('Button');
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
			console.log(err);
			await inter.reply({
				content: 'There was an error while executing this button.',
				ephemeral: true,
			});
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

	public build() {
		return this.builder;
	}

	public buildAsRow() {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			this.builder
		);
	}
}
