import { type ButtonInteraction, type CacheType, type ButtonBuilder } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';

export default class ManagePlayersButton extends CustomButton {
	static customId = 'manage-vc-players-tab';
	constructor() {
		super(ManagePlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genPlayersEmbed(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Manage Players');
	}
}
