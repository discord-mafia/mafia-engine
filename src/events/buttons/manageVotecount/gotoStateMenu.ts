import { getVoteCounter } from '../../../models/votecounter';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { genCreateVoteCountEmbed, genStateEmbed } from '../../../views/votecounter';

export default new CustomButtonBuilder('manage-vc-state-menu')
	.onGenerate((builder) => builder.setLabel('Manage State'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genStateEmbed(vc);
		i.update(payload);
	});
