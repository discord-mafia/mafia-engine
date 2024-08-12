import { ActionRowBuilder, TextInputBuilder, type CacheType, type ModalSubmitInteraction, type ModalActionRowComponentBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';
import { InteractionError } from '../../structures/interactions/_Interaction';
import { prisma } from '../..';
import { getVoteCounter } from '../../models/votecounter';
import { genCreateVoteCountEmbed, genStateEmbed } from '../../views/votecounter';

export default new Modal('manage-vc-players-set-timed-majority')
	.set((modal) => {
		modal.setTitle('Set Timed Majority');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('discord-timestamp').setLabel('Discord Timestamp ("none" to clear)').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		const discordTimestamp = i.fields.getTextInputValue('discord-timestamp');
		if (!discordTimestamp) throw new InteractionError('No discord timestamp was supplied');

		const timestamp = Math.floor(Number(discordTimestamp) * 1000);
		if (isNaN(timestamp) && discordTimestamp != 'none') throw new InteractionError('The provided timestamp was invalid, or not "none"');

		try {
			await prisma.voteCounter.update({
				where: {
					channelId: i.channel.id,
				},
				data: {
					majorityAfter: discordTimestamp == 'none' ? null : new Date(timestamp),
				},
			});
		} catch (err) {
			await i.reply({
				content: 'An unknown error occurred',
				ephemeral: true,
			});
		}

		const newVC = await getVoteCounter({ channelId: i.channel.id });
		if (!newVC) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const stateMenuPayload = genStateEmbed(newVC);
		await i.reply({ ...stateMenuPayload, ephemeral: true });
	});
