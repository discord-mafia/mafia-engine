import { getVoteCounter } from '../../../models/votecounter';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '../../../views/votecounter';

export default new CustomButtonBuilder('manage-vc-players-tab')
	.onGenerate((builder) => builder.setLabel('Manage Players'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genPlayersEmbed(vc);
		i.update(payload);
	});
