import { getVoteCounter } from '../../../../models/votecounter';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { genCreateVoteCountEmbed } from '../../../../views/votecounter';
import setTimedMajority from '../../../modals/setTimedMajority';

export default new CustomButtonBuilder('manage-vc-players-set-timed-majority')
	.onGenerate((builder) => builder.setLabel('Set Timed Majority'))
	.onExecute(async (i) => {
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const modal = setTimedMajority.getModalBuilder();
		await i.showModal(modal);
	});
