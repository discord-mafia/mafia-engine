import { ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { anonEmbedManageProfiles, embedCreateAnonymousGroup } from '@views/anonymity';
import unlinkChannel from '@root/events/selectMenus/anonymity/unlinkChannel';
import { getAnonymousGroup } from '@models/anonymity';

export default new CustomButtonBuilder('manage-anonymity-unlink-channel')
	.onGenerate((builder) => builder.setLabel('Unlink Channel'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const group = await getAnonymousGroup(i.channelId);
		const payload = group ? await anonEmbedManageProfiles(group) : embedCreateAnonymousGroup();
		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>();
		row.addComponents(unlinkChannel.build());
		if (group) payload.components = [row];

		return await i.update(payload);
	});
