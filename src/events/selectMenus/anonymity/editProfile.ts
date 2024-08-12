import { getAnonymousGroup, getAnonymousProfile } from '../../../models/anonymity';
import { CustomStringSelectMenu } from '../../../structures/interactions/StringSelectMenu';
import { embedCreateAnonymousGroup, anonEmbedManageProfiles, anonEmbedManageSpecificProfile } from '../../../views/anonymity';

export default new CustomStringSelectMenu('anonymity-select-profile-edit')
	.onGenerate((b) => b.setMaxValues(1).setMinValues(1).setPlaceholder('Select the profile you wish to edit'))
	.onExecute(async (i) => {
		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		if (i.values.length === 0 || !i.values[0]) return await i.update(await anonEmbedManageProfiles(group));
		const profileID = parseInt(i.values[0]);
		if (isNaN(profileID)) return await i.update(await anonEmbedManageProfiles(group));

		const profile = await getAnonymousProfile(profileID);
		if (!profile) return await i.update(await anonEmbedManageProfiles(group));

		const payload = await anonEmbedManageSpecificProfile(profile);

		await i.update(payload);
	});
