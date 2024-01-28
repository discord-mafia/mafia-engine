import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed } from '@views/votecounter';

import SetDayModal from '../../../modals/setDay';

export default new CustomButtonBuilder('manage-vc-players-jump-to-day')
	.onGenerate((builder) => builder.setLabel('Set Day'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const modal = SetDayModal.getModalBuilder();
		await i.showModal(modal);
	});
