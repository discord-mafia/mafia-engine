import { getAnonymousGroup } from '@models/anonymity';
import linkChannel from '@root/events/buttons/anonymity/channels/linkChannel';
import unlinkChannel from '@root/events/buttons/anonymity/channels/unlinkChannel';
import CreateAnonymityGroup from '@root/events/buttons/anonymity/createAnonymityGroup';
import gotoChannels from '@root/events/buttons/anonymity/gotoChannels';
import gotoHome from '@root/events/buttons/anonymity/gotoHome';
import gotoProfiles from '@root/events/buttons/anonymity/gotoProfiles';
import newProfile from '@root/events/buttons/anonymity/profiles/newProfile';
import removeProfile from '@root/events/buttons/anonymity/profiles/removeProfile';
import updateProfile from '@root/events/buttons/anonymity/profiles/updateProfile';
import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, EmbedBuilder } from 'discord.js';

export function embedCreateAnonymousGroup(): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Create Anonymous Group');
	embed.setDescription('There is anonymous group in this channel');
	embed.setColor('Red');
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(CreateAnonymityGroup.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export async function anonEmbedMainPage(channelId: string): Promise<BaseMessageOptions> {
	const group = await getAnonymousGroup(channelId);
	if (!group || group.linkedChannels.length == 0) return embedCreateAnonymousGroup();

	const embed = new EmbedBuilder();
	embed.setTitle('Anonymous Group');
	embed.setColor('White');

	embed.addFields({
		name: `Linked Channels (${group.linkedChannels.length})`,
		value: group.linkedChannels.map((v) => `> <#${v}>`).join('\n'),
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(gotoChannels.build(), gotoProfiles.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export async function anonEmbedManageChannels(channelId: string): Promise<BaseMessageOptions> {
	const group = await getAnonymousGroup(channelId);
	if (!group || group.linkedChannels.length == 0) return embedCreateAnonymousGroup();

	const embed = new EmbedBuilder();
	embed.setTitle('Anonymous Group - Manage Channels');
	embed.setColor('White');

	embed.addFields({
		name: `Linked Channels (${group.linkedChannels.length})`,
		value: group.linkedChannels.map((v) => `> <#${v}>`).join('\n'),
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(gotoHome.build(), linkChannel.build(), unlinkChannel.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export async function anonEmbedManageProfiles(channelId: string): Promise<BaseMessageOptions> {
	const group = await getAnonymousGroup(channelId);
	if (!group || group.linkedChannels.length == 0) return embedCreateAnonymousGroup();

	const embed = new EmbedBuilder();
	embed.setTitle('Anonymous Group - Manage Profiles');
	embed.setColor('White');

	embed.addFields({
		name: `Linked Channels (${group.linkedChannels.length})`,
		value: group.linkedChannels.map((v) => `> <#${v}>`).join('\n'),
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(gotoHome.build(), newProfile.build(), updateProfile.build(), removeProfile.build());

	return {
		embeds: [embed],
		components: [row],
	};
}
