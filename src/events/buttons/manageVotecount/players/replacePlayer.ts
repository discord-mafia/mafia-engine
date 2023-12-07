import { ActionRowBuilder, type UserSelectMenuBuilder, type ButtonBuilder, type ButtonInteraction, type CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/automaticGames';
import { generateManagePlayersEmbed } from '../gotoPlayersMenu';
import { manageVoteCountEmbeds } from '../goHome';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import ReplacePlayersMenu from '../../../selectMenus/manageVotecount/replacePlayer';

export default class ReplacePlayersButton extends CustomButton {
	static customId = 'manage-vc-players-replace';
	constructor() {
		super(ReplacePlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return manageVoteCountEmbeds.create();
		const payload = generateManagePlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(ReplacePlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Replace Player');
	}
}
