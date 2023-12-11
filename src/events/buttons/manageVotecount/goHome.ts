import { type ButtonBuilder, type ButtonInteraction, ButtonStyle, type CacheType } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';

export default class GoHomeButton extends CustomButton {
	static customId = 'manage-vc-home';
	constructor() {
		super(GoHomeButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genVoteCountEmbed(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Home').setStyle(ButtonStyle.Primary);
	}
}
