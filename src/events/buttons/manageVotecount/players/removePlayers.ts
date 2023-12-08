import { type UserSelectMenuBuilder, type ButtonBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { manageVoteCountEmbeds } from '../goHome';
import { generateManagePlayersEmbed } from '../gotoPlayersMenu';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import RemovePlayersMenu from '../../../selectMenus/manageVotecount/removePlayers';

export default class AddPlayersButton extends CustomButton {
	static customId = 'manage-vc-players-remove';
	constructor() {
		super(AddPlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return manageVoteCountEmbeds.create();
		const payload = generateManagePlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(RemovePlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Remove Player/s');
	}
}
