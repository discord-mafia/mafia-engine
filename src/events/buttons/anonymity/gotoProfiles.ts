import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageProfiles } from '@views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-goto-profiles')
	.onGenerate((builder) => builder.setLabel('Manage Profiles'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = await anonEmbedManageProfiles(i.channelId);
		return await i.update(payload);
	});
