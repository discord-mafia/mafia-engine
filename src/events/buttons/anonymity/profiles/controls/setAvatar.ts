import { getAnonymousGroup } from '@models/anonymity';
import setAvatar from '@root/events/modals/anonymity/setAvatar';
import { CustomButtonBuilder } from '@structures/interactions/Button';
import { InteractionError } from '@structures/interactions/_Interaction';
import { embedCreateAnonymousGroup } from '@views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-profile-set-avatar')
	.onGenerate((builder) => builder.setLabel('Set Avatar'))
	.onExecute(async (i, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!cache) throw new InteractionError('This button is invalid');
		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		const modal = setAvatar.getModalBuilder().setCustomId(setAvatar.createCustomID(cache));
		await i.showModal(modal);
	});
