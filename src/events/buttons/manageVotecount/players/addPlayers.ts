import { type UserSelectMenuBuilder, type ButtonBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '../../../../util/database';
import { manageVoteCountEmbeds } from '../../../../interactions/commands/voting/manage-votecount';
import { generateManagePlayersEmbed } from '../gotoPlayersMenu';
import AddPlayersMenu from '../../../selectMenus/manageVotecount/addPlayers';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';

export default class AddPlayersButton extends CustomButton {
	static customId = 'manage-vc-players-add';
	constructor() {
		super(AddPlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return manageVoteCountEmbeds.create();
		const payload = generateManagePlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(AddPlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Add Player/s');
	}
}
