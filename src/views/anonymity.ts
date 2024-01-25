import CreateAnonymityGroup from '@root/events/buttons/anonymity/createAnonymityGroup';
import { CustomButton } from '@structures/interactions/Button';
import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, EmbedBuilder } from 'discord.js';

export function embedCreateAnonymousGroup(): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Create Anonymous Group');
	embed.setDescription('There is anonymous group in this channel');
	embed.setColor('Red');
	const row = new ActionRowBuilder<ButtonBuilder>();

	const btn = CustomButton.getButtonOrThrow(CreateAnonymityGroup.customId);
	row.addComponents(btn.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}
