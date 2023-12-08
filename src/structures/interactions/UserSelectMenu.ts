import { UserSelectMenuBuilder, type UserSelectMenuInteraction } from 'discord.js';
import { Interaction } from '../interactions';

export class UserSelectMenu extends Interaction {
	public static userSelectMenus = new Map<string, UserSelectMenu>();

	constructor(customID: string) {
		super(customID);
		if (UserSelectMenu.userSelectMenus.has(customID)) throw new Error(`Custom ID ${customID} already exists.`);
		UserSelectMenu.userSelectMenus.set(customID, this);
	}

	generateUserSelectMenu(data?: string) {
		return new UserSelectMenuBuilder().setCustomId(this.createCustomID(data));
	}

	async onExecute(_i: UserSelectMenuInteraction, _cache?: string): Promise<unknown | void> {
		return undefined;
	}

	static getUserSelectMenuOrThrow(customId: string) {
		const button = UserSelectMenu.userSelectMenus.get(customId);
		if (button) return button;
		else throw Error(`No user select menu with custom ID ${customId} was found.`);
	}
}
