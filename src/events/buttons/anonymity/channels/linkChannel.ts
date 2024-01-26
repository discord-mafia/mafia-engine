import { anonEmbedManageChannels } from '@views/anonymity';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import linkChannel from '@root/events/selectMenus/anonymity/linkChannel';

export default new CustomButtonBuilder('manage-anonymity-link-channel')
	.onGenerate((builder) => builder.setLabel('Link Channel'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = await anonEmbedManageChannels(i.channelId);

		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>();
		row.addComponents(linkChannel.build());
		payload.components = [row];

		return await i.update(payload);
	});
