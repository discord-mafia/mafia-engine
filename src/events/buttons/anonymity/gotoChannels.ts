import { getAnonymousGroup } from '@models/anonymity';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageChannels, embedCreateAnonymousGroup } from '@views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-goto-channels')
	.onGenerate((builder) => builder.setLabel('Manage Channels'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const group = await getAnonymousGroup(i.channelId);
		const payload = group ? await anonEmbedManageChannels(group) : embedCreateAnonymousGroup();
		return await i.update(payload);
	});
