import {
	ActionRowBuilder,
	type AnySelectMenuInteraction,
	type ButtonBuilder,
	type ButtonInteraction,
	Collection,
	ModalBuilder,
	type ModalSubmitInteraction,
	type TextInputBuilder,
	type Interaction as CoreInteraction,
	type MessagePayload,
	type BaseInteraction,
} from 'discord.js';
import type { UnknownResponse } from '../types/response';
import fs from 'fs';
import path from 'path';
type CustomID = string;

export class InteractionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InteractionError';
	}
}

export class Interaction {
	private customId: CustomID;
	constructor(customId: CustomID) {
		this.customId = customId;
		console.log(`Loaded [${this.customId}]`);
	}

	public getCustomID() {
		return this.customId;
	}

	public createCustomID(data: string | undefined) {
		if (!data) return this.getCustomID();
		return `${this.customId}_${data}`;
	}

	static getDataFromCustomID(customIdString: string): [CustomID, string | undefined] {
		const split = customIdString.split('_');
		const customId = split.shift();
		const data = split.join('_');
		if (!customId) return [customIdString, undefined];
		if (!data) return [customId, ''];
		return [customId, data];
	}

	static async loadInteractions(newPath: string, recursive: boolean = true) {
		const commandPath = newPath;

		const loadFiles = async (dirPath: string) => {
			try {
				const files = fs.readdirSync(dirPath);
				for (const file of files) {
					const filePath = path.join(dirPath, file);
					const stats = fs.statSync(filePath);
					if (stats.isDirectory() && recursive) {
						await loadFiles(filePath); // Recursive call for subdirectories
					} else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
						try {
							// eslint-disable-next-line @typescript-eslint/no-var-requires
							const fileData = require(filePath);
							for (const key in fileData) {
								const value = fileData[key];
								if (value.prototype instanceof Interaction) {
									new value();
								}
							}
						} catch (err) {
							console.log(`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`);
							console.error(err);
						}
					}
				}
			} catch (err) {
				console.log(`\x1B[31mFailed to load directory: \x1B[34m${newPath}\x1B[0m`);
			}
		};

		await loadFiles(commandPath);
	}

	async onError(i: BaseInteraction, err: unknown) {
		let errorMessage;

		if (err instanceof InteractionError) errorMessage = err.message;
		else if (err instanceof Error) errorMessage = err.message;
		else if (typeof err === 'string') errorMessage = err;
		else errorMessage = 'An unknown error occurred';

		if (i.isMessageComponent()) {
			{
				try {
					if (i.deferred || i.replied) {
						await i.editReply({
							content: errorMessage,
						});
					} else if (i.isRepliable()) {
						await i.reply({
							content: errorMessage,
							ephemeral: true,
						});
					} else {
						throw new Error(errorMessage);
					}
				} catch (error) {
					console.error('Failed to send error message:', error);
				}
			}
		} else {
			if (i.isRepliable()) {
				await i.reply({
					content: errorMessage,
					ephemeral: true,
				});
			} else {
				console.error('Failed to send error message:', err);
			}
		}
	}
}

export class Button extends Interaction {
	static buttons: Collection<CustomID, Button> = new Collection();
	private func: undefined | ((i: ButtonInteraction, cache?: string) => UnknownResponse);
	private buttonBuilder: ButtonBuilder | undefined;
	private customID: CustomID;
	constructor(customId: CustomID) {
		super(customId);
		this.customID = customId;
		Button.buttons.set(customId, this);
	}

	public setButton(button: ButtonBuilder) {
		this.buttonBuilder = button;
		return this;
	}

	public getButton(cache?: string) {
		const newButton = this.buttonBuilder;
		if (!newButton) return null;
		if (cache) newButton.setCustomId(`${this.customID}_${cache}`);
		else newButton.setCustomId(this.customID);
		return newButton;
	}

	public onExecute(func: (i: ButtonInteraction, cache?: string) => UnknownResponse) {
		this.func = func;
		return this;
	}

	public execute(i: ButtonInteraction, cacheHandle: string | undefined) {
		if (!i.isButton()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export class SelectMenu extends Interaction {
	static selectMenus: Collection<CustomID, SelectMenu> = new Collection();
	private func: undefined | ((i: AnySelectMenuInteraction, cache: string | undefined) => UnknownResponse);
	constructor(customId: CustomID) {
		super(customId);
		SelectMenu.selectMenus.set(customId, this);
	}

	public onExecute(func: (i: AnySelectMenuInteraction, cache: string | undefined) => UnknownResponse) {
		this.func = func;
		return this;
	}

	public execute(i: AnySelectMenuInteraction, cacheHandle: string | undefined) {
		if (!i.isAnySelectMenu()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export type ModalFunc = (i: ModalSubmitInteraction, cache?: string) => unknown;
export type ModalFill = (modal: ModalBuilder, cache?: string) => ActionRowBuilder<TextInputBuilder>[] | Promise<ActionRowBuilder<TextInputBuilder>[]>;
export class Modal extends Interaction {
	static modals: Collection<CustomID, Modal> = new Collection();
	private func: undefined | ModalFunc;
	private hydrateFunc: undefined | ModalFill;
	private modalBuilder: ModalBuilder;
	private customID: string;

	constructor(customId: CustomID, title: string) {
		super(customId);
		this.modalBuilder = new ModalBuilder().setTitle(title);
		this.modalBuilder.setCustomId(customId);
		this.customID = customId;
		Modal.modals.set(customId, this);
	}

	public hydrate(func: ModalFill) {
		this.hydrateFunc = func;
		return this;
	}

	public async getModal(cache?: string) {
		const newModal = this.modalBuilder;
		if (this.hydrateFunc) newModal.setComponents(await this.hydrateFunc(newModal, cache));

		if (cache) newModal.setCustomId(`${this.customID}_${cache}`);
		else newModal.setCustomId(this.customID);

		console.log('HERE');
		return newModal;
	}

	public newInput(input: TextInputBuilder) {
		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
		this.modalBuilder.addComponents(row);
		return this;
	}

	public onExecute(func: ModalFunc) {
		this.func = func;
		return this;
	}

	public execute(i: ModalSubmitInteraction, cacheHandle: string | undefined) {
		if (!i.isModalSubmit()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export async function safeReply(i: CoreInteraction, data: string | MessagePayload) {
	if (!i.isRepliable()) return;
	if (i.replied) return await i.followUp(data);
	else return await i.reply(data);
}
