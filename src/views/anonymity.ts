import CreateAnonymityGroup from '@root/events/buttons/anonymity/createAnonymityGroup';
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
