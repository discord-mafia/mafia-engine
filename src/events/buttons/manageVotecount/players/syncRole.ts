import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genPlaceholderEmbed } from '@views/votecounter';

export default new CustomButtonBuilder('manage-vc-players-sync-role')
	.onGenerate((builder) => builder.setLabel('Sync Role'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		const payload = genPlaceholderEmbed(vc ?? undefined);
		i.update(payload);
	});
