import { ActionRowBuilder, UserSelectMenuBuilder } from 'discord.js';
import { getAnonymousGroup, getAnonymousProfile } from '../../../../../models/anonymity';
import { CustomButtonBuilder } from '../../../../../structures/interactions/Button';
import { InteractionError } from '../../../../../structures/interactions/_Interaction';
import { embedCreateAnonymousGroup, anonEmbedManageSpecificProfile } from '../../../../../views/anonymity';
import setProfileUser from '../../../../selectMenus/anonymity/setProfileUser';

export default new CustomButtonBuilder('manage-anonymity-profile-set-user')
	.onGenerate((builder) => builder.setLabel('Set User'))
	.onExecute(async (i, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!cache) throw new InteractionError('This button is invalid');
		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		const profileID = parseInt(cache);
		if (isNaN(profileID)) throw new InteractionError('This button is invalid [ERR02]');

		const profile = await getAnonymousProfile(profileID);
		if (!profile) throw new InteractionError('This profile no longer exists');

		const payload = await anonEmbedManageSpecificProfile(profile);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();
		row.addComponents(setProfileUser.build(cache));
		payload.components = [row];

		return await i.update(payload);
	});
