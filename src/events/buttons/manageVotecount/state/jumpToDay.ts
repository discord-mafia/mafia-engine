import { type ButtonBuilder, type ButtonInteraction, type CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/automaticGames';
import { generatePlaceholder } from '../gotoPlayersMenu';
import { Modal } from '../../../../structures/interactions/Modal';
import SetDayModal from '../../../modals/setDay';

export default class JumpToDayButton extends CustomButton {
	static customId = 'manage-vc-players-jump-to-day';
	constructor() {
		super(JumpToDayButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(generatePlaceholder(vc ?? undefined));

		// Unhandled error
		const setDayModal = Modal.getModalOrThrow(SetDayModal.customId);
		const modal = setDayModal.generateModal();
		await i.showModal(modal);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Set Day');
	}
}
