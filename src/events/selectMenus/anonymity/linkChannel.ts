import { getAnonymousGroup, linkChannelToGroup } from '@models/anonymity';
import { CustomChannelSelectMenu } from '@structures/interactions/ChannelSelectMenu';
import { anonEmbedManageChannels, embedCreateAnonymousGroup } from '@views/anonymity';
import { ChannelType } from 'discord.js';

export default new CustomChannelSelectMenu('anonymity-select-channels-link')
	.onGenerate((builder) => builder.setPlaceholder('Select the channel to link').setMinValues(1).setMaxValues(1))
	.onExecute(async (i) => {
		const fields = i.values;
		const channelID = fields[0];

		const group = await getAnonymousGroup(i.channelId);
		if (!group) {
			const payload = embedCreateAnonymousGroup();
			return await i.update(payload);
		}

		if (!channelID) {
			const payload = await anonEmbedManageChannels(group);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'You did not select a channel',
			});
		}

		const channel = await i.guild?.channels.fetch(channelID);
		if (!channel || channel.type != ChannelType.GuildText) {
			const payload = await anonEmbedManageChannels(group);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'You did not select a valid text channel',
			});
		}

		const existingGroup = await getAnonymousGroup(channel.id);
		if (existingGroup) {
			const payload = await anonEmbedManageChannels(group);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'This channel is already linked to another anonymous group',
			});
		}

		const linkNewChannel = await linkChannelToGroup(group.id, channel.id);
		if (!linkNewChannel) {
			const payload = await anonEmbedManageChannels(group);
			await i.update(payload);
			return await i.followUp({
				ephemeral: true,
				content: 'An error occurred while trying to link this channel',
			});
		}

		const payload = await anonEmbedManageChannels(group);
		return await i.update(payload);
	});
