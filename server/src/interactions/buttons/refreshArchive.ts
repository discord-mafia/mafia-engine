import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Button } from '../../structures/interactions';
import { getArchive } from '../../util/database';
import { formatArchive } from '../commands/archive';
import viewArchiveMentions from './viewArchiveMentions';

export default new Button('refresh-archive-mentions')
	.setButton(new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger))
	.onExecute(async (i, cache) => {
		if (!cache) return i.reply({ content: 'This button is invalid', ephemeral: true });
		if (!i.guild) return;

		await i.deferReply({ ephemeral: true });

		const archive = await getArchive(cache);
		if (!archive) return i.editReply({ content: 'This button is invalid' });

		const formattedArchive = formatArchive(archive);
		const { content, image } = formattedArchive;
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId(viewArchiveMentions.createCustomID(cache)).setLabel('View Mentions').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(`refresh-archive-mentions_${cache}`).setLabel('Refresh').setStyle(ButtonStyle.Secondary)
		);

		await i.message.edit({
			content,
			files: image
				? [
						{
							attachment: image,
							name: 'archive.png',
						},
				  ]
				: undefined,
			components: [row],
		});

		await i.editReply({ content: 'Archive refreshed' });
	});
