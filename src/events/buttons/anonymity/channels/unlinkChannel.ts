import { ActionRowBuilder, ChannelSelectMenuBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { InteractionError } from '../../../../structures/interactions/_Interaction';
import { anonEmbedManageChannels } from '@views/anonymity';
import unlinkChannel from '@root/events/selectMenus/anonymity/unlinkChannel';

export default new CustomButtonBuilder('manage-anonymity-unlink-channel')
	.onGenerate((builder) => builder.setLabel('Unlink Channel'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		const payload = await anonEmbedManageChannels(i.channelId);
		const row = new ActionRowBuilder<ChannelSelectMenuBuilder>();
		row.addComponents(unlinkChannel.build());
		payload.components = [row];

		return await i.update(payload);
	});
