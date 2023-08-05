import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '../..';
import { Button } from '../../structures/interactions';

export default new Button('archive-manage-members')
	.setButton(new ButtonBuilder().setLabel('Delete').setStyle(ButtonStyle.Danger))
	.onExecute(async (i, cache) => {
		if (!i.guild) return;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('archive-add-host').setLabel('Add Host').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('archive-add-cohost').setLabel('Add Co-Host').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('archive-add-winner').setLabel('Add Winner').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId('archive-add-loser').setLabel('Add Loser').setStyle(ButtonStyle.Secondary)
		);

		await i.reply({ content: 'Please select the type of member you would like to add', components: [row], ephemeral: true });
	});

new Button('archive-add-host').onExecute(async (i, cache) => {
	if (!i.guild) return;

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId('archive-add-host-select').setLabel('Select Member').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId('archive-add-missing-host').setLabel('Add Host Manually').setStyle(ButtonStyle.Secondary)
	);
	await i.reply({ content: 'Select the first option if they are in the server, otherwise manual selection', components: [row], ephemeral: true });
});
