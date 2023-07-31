import {
	ActionRowBuilder,
	AnySelectMenuInteraction,
	ButtonBuilder,
	ButtonInteraction,
	Collection,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
	Interaction as CoreInteraction,
	MessagePayload,
} from 'discord.js';
type CustomID = string;
type AnyOutcome = any | Promise<any>;

type EventFunc = (...val: any) => AnyOutcome;
export class Event {
	static events: Collection<CustomID, Event> = new Collection();
	private event: CustomID;
	private func: EventFunc | undefined;
	constructor(event: CustomID) {
		this.event = event;
		Event.events.set(this.event, this);

		console.log(`Loaded [${this.event}]`);
	}

	public getCustomID() {
		return this.event;
	}

	public onExecute(func: EventFunc) {
		this.func = func;
		return this;
	}

	public execute(...val: any) {
		if (this.func) this.func(...val);
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

	public createCustomID(data: string) {
		// Check REGEX if contains an underscore.
		return `${this.customId}_${data}`;
	}

	static getDataFromCustomID(customIdString: string): [CustomID, string] {
		const split = customIdString.split('_');
		return [split[0], split[1]];
	}
}

export class Button extends Interaction {
	static buttons: Collection<CustomID, Button> = new Collection();
	private func: undefined | ((i: ButtonInteraction, cache?: string) => any | Promise<any>);
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

	public onExecute(func: (i: ButtonInteraction, cache?: string) => any | Promise<any>) {
		this.func = func;
		return this;
	}

	public execute(i: ButtonInteraction, cacheHandle: string) {
		if (!i.isButton()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export class SelectMenu extends Interaction {
	static selectMenus: Collection<CustomID, SelectMenu> = new Collection();
	private func: undefined | ((i: AnySelectMenuInteraction, cache: string) => any | Promise<any>);
	constructor(customId: CustomID) {
		super(customId);
		SelectMenu.selectMenus.set(customId, this);
	}

	public onExecute(func: (i: AnySelectMenuInteraction, cache: string) => any | Promise<any>) {
		this.func = func;
		return this;
	}

	public execute(i: AnySelectMenuInteraction, cacheHandle: string) {
		if (!i.isAnySelectMenu()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export type ModalFunc = (i: ModalSubmitInteraction, cache?: string) => AnyOutcome;
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
		let newModal = this.modalBuilder;
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

	public execute(i: ModalSubmitInteraction, cacheHandle: string) {
		if (!i.isModalSubmit()) return;
		if (this.func) this.func(i, cacheHandle);
	}
}

export async function safeReply(i: CoreInteraction, data: string | MessagePayload) {
	if (!i.isRepliable()) return;
	if (i.replied) return await i.followUp(data);
	else return await i.reply(data);
}
