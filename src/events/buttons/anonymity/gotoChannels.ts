import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageChannels } from '@views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-goto-channels')
	.onGenerate((builder) => builder.setLabel('Manage Channels'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = await anonEmbedManageChannels(i.channelId);
		return await i.update(payload);
	});
