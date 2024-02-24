import { getAnonymousGroup, createAnonymousProfile } from '../../../../models/anonymity';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { embedCreateAnonymousGroup, anonEmbedManageProfiles, anonEmbedManageSpecificProfile } from '../../../../views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-profile-new')
	.onGenerate((builder) => builder.setLabel('Add Profile'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		const profile = await createAnonymousProfile(group.id);
		if (!profile) return await i.update(await anonEmbedManageProfiles(group));

		const payload = await anonEmbedManageSpecificProfile(profile);
		return await i.update(payload);
	});
