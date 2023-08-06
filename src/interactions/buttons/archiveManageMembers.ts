import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../..';
import { Button } from '../../structures/interactions';
import { getArchive } from '../../util/database';
import { formatArchive } from '../commands/archive';

export default new Button('archive-view')
	.setButton(new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger))
	.onExecute(async (i, cache) => {
		if (!i.guild) return;
		if (!cache) return i.reply({ content: 'This button is invalid', ephemeral: true });

		const archive = await getArchive(cache);
		if (!archive) return i.reply({ content: 'This button is invalid', ephemeral: true });

		const { content, image } = formatArchive(archive);
		return i.reply({
			content,
			ephemeral: true,
			files: image
				? [
						{
							attachment: image,
							name: 'archive.png',
						},
				  ]
				: undefined,
		});
	});

export function createViewArchiveButton(gameTag: string) {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('archive-view_' + gameTag)
			.setLabel('View Archive')
			.setStyle(ButtonStyle.Secondary)
	);
}
