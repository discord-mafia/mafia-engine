import { type UserSelectMenuBuilder, type ButtonBuilder, type ButtonInteraction, type CacheType, ActionRowBuilder } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import AddPlayersMenu from '../../../selectMenus/manageVotecount/addPlayers';
import { UserSelectMenu } from '../../../../structures/interactions/UserSelectMenu';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';

export default class AddPlayersButton extends CustomButton {
	static customId = 'manage-vc-players-add';
	constructor() {
		super(AddPlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);
		const row = new ActionRowBuilder<UserSelectMenuBuilder>();

		const select = UserSelectMenu.getUserSelectMenuOrThrow(AddPlayersMenu.customId);
		row.addComponents(select.generateUserSelectMenu());

		i.update({ embeds: payload.embeds, components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Add Player/s');
	}
}
