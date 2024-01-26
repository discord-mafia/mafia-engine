import { anonEmbedManageChannels } from '@views/anonymity';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';

export default new CustomButtonBuilder('manage-anonymity-link-channel')
	.onGenerate((builder) => builder.setLabel('Link Channel'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = await anonEmbedManageChannels(i.channelId);
		return await i.update(payload);
	});
