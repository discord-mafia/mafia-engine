import { getAnonymousGroup, deleteManyAnonymousProfiles, getAnonymousGroupById } from '../../../models/anonymity';
import { CustomStringSelectMenu } from '../../../structures/interactions/StringSelectMenu';
import { embedCreateAnonymousGroup, anonEmbedManageProfiles } from '../../../views/anonymity';

export default new CustomStringSelectMenu('anonymity-select-profile-remove')
	.onGenerate((b) => b.setMinValues(1).setMaxValues(1).setPlaceholder('Select the profiles you wish to remove'))
	.onExecute(async (i) => {
		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		const profileIDs = i.values.map((v) => parseInt(v)).filter((v) => !isNaN(v));
		await deleteManyAnonymousProfiles(profileIDs);

		const refreshedGroup = await getAnonymousGroupById(group.id);
		if (!refreshedGroup) return await i.update(embedCreateAnonymousGroup());
		const payload = await anonEmbedManageProfiles(refreshedGroup);

		await i.update(payload);
	});
