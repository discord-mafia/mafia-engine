import { getAnonymousGroup, getAnonymousProfiles } from '@models/anonymity';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { anonEmbedManageProfiles, embedCreateAnonymousGroup } from '@views/anonymity';
import editProfile from '@root/events/selectMenus/anonymity/editProfile';
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default new CustomButtonBuilder('manage-anonymity-profile-update')
	.onGenerate((builder) => builder.setLabel('Edit Profile'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const group = await getAnonymousGroup(i.channelId);
		if (!group) return await i.update(embedCreateAnonymousGroup());

		const profiles = (await getAnonymousProfiles(group.id)) ?? [];
		const payload = await anonEmbedManageProfiles(group);

		if (profiles.length === 0) return await i.update(payload);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>();

		const options = profiles.map((v, i) => {
			return {
				label: `${i + 1}. ${v.name ?? 'Unnamed'}`,
				value: v.id.toString(),
			};
		});

		row.addComponents(editProfile.build().addOptions(options));
		if (group) payload.components = [row];

		return await i.update(payload);
	});
