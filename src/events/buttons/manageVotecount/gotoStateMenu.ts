import { type ButtonInteraction, type CacheType, type ButtonBuilder } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';

export default class GotoStateButton extends CustomButton {
	static customId = 'manage-vc-state-menu';
	constructor() {
		super(GotoStateButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genStateEmbed(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Manage State');
	}
}
