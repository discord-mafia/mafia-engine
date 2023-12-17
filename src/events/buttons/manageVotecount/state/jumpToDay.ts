import { type ButtonBuilder, type ButtonInteraction, type CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import SetDayModal from '../../../modals/setDay';
import { genCreateVoteCountEmbed } from '@views/votecounter';

export default class JumpToDayButton extends CustomButton {
	static customId = 'manage-vc-players-jump-to-day';
	constructor() {
		super(JumpToDayButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const modal = SetDayModal.getModalBuilder();
		await i.showModal(modal);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Set Day');
	}
}
