import { getAnonymousProfile, updateAnonymousProfile } from '@models/anonymity';
import { CustomUserSelectMenuBuilder } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedManageSpecificProfile } from '@views/anonymity';

export default new CustomUserSelectMenuBuilder('anon-profile-set-user')
	.onGenerate((builder) => builder.setMaxValues(1).setMinValues(1).setPlaceholder('Players to set as the anonymous profile'))
	.onExecute(async (i, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!cache) throw new InteractionError('This modal was invalid [ERR01]');
		const profileID = parseInt(cache);
		if (isNaN(profileID)) throw new InteractionError('This model was invalid [ERR02]');

		const values = i.values;
		if (!values) throw new InteractionError('No user were provided');

		const profile = await getAnonymousProfile(profileID);
		if (!profile) throw new InteractionError('This profile no longer exists');

		const updated = await updateAnonymousProfile(profile.id, {
			discordId: values[0],
		});

		const payload = await anonEmbedManageSpecificProfile(updated);
		return await i.update(payload);
	});
