import { getAnonymousGroup, unlinkChannelFromGroup } from '@models/anonymity';
import { CustomChannelSelectMenu } from '@structures/interactions/ChannelSelectMenu';
import { anonEmbedManageChannels, embedCreateAnonymousGroup } from '@views/anonymity';
import { ChannelType } from 'discord.js';

export default new CustomChannelSelectMenu('anonymity-select-channels-unlink')
	.onGenerate((builder) => builder.setPlaceholder('Select the channel to unlink').setMinValues(1).setMaxValues(1))
	.onExecute(async (i) => {
		const fields = i.values;
		const channelID = fields[0];

		const group = await getAnonymousGroup(i.channelId);
		if (!group) {
			const payload = embedCreateAnonymousGroup();
			return await i.update(payload);
		}

		if (!channelID) {
			const payload = await anonEmbedManageChannels(i.channelId);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'You did not select a channel',
			});
		}

		const channel = await i.guild?.channels.fetch(channelID);
		if (!channel || channel.type != ChannelType.GuildText) {
			const payload = await anonEmbedManageChannels(i.channelId);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'You did not select a valid text channel',
			});
		}

		if (!group.linkedChannels.includes(channel.id)) {
			const payload = await anonEmbedManageChannels(i.channelId);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'The selected channel is not a part of this anonymous group',
			});
		}

		const unlinked = await unlinkChannelFromGroup(group.id, channel.id);
		if (!unlinked) {
			const payload = await anonEmbedManageChannels(i.channelId);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'An error occurred while trying to link this channel',
			});
		}

		const payload = await anonEmbedManageChannels(i.channelId);
		return await i.update(payload);
	});
