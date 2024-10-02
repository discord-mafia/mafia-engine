import { UserSelectMenuBuilder, UserSelectMenuInteraction } from 'discord.js';
import { handleInteractionError } from '../utils/errors';
import { CustomId } from '../utils/customId';

export type TextSelectMenuContext = string | undefined;

export type UserSelectMenuExecute = (
	i: UserSelectMenuInteraction,
	ctx: TextSelectMenuContext
) => unknown | Promise<unknown>;

const defaultTextSelectMenuExecute: UserSelectMenuExecute = async (i, _ctx) => {
	await i.reply({
		content: 'This user select menu has not been implemented yet.',
		ephemeral: true,
	});
};

export class UserSelectMenu extends UserSelectMenuBuilder {
	public static selectMenus = new Map<string, UserSelectMenu>();
	private executeFunction: UserSelectMenuExecute =
		defaultTextSelectMenuExecute;
	private staticCustomId: string;
	constructor(custom_id: string) {
		super();
		if (UserSelectMenu.selectMenus.has(custom_id))
			throw new Error(`User select menu ${custom_id} already exists.`);

		if (!CustomId.verifyRaw(custom_id))
			throw new Error(
				`User select menu ${custom_id} is not in the correct format.`
			);

		this.setCustomId(custom_id);
		this.staticCustomId = custom_id;
		UserSelectMenu.selectMenus.set(custom_id, this);
	}

	public onExecute(executeFunction: UserSelectMenuExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public async run(inter: UserSelectMenuInteraction, ctx?: string) {
		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			await handleInteractionError(err, inter);
		}
	}

	public getCustomId() {
		return this.staticCustomId;
	}

	public build(customId?: string) {
		const newBuilder = new UserSelectMenuBuilder(this.data);
		if (customId) newBuilder.setCustomId(customId);
		return newBuilder;
	}
}
