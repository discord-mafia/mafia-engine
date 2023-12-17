import {
	ActionRowBuilder,
	TextInputBuilder,
	type CacheType,
	type ModalSubmitInteraction,
	type ModalActionRowComponentBuilder,
	TextInputStyle,
} from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';
import { InteractionError } from '../../structures/interactions/_Interaction';
import { prisma } from '../..';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';

export default new Modal('manage-vc-players-set-day')
	.set((modal) => {
		modal.setTitle('Set Day');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('day-number').setLabel('Day Number').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>) => {
		console.log('set day modal');
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		const dayNumberRaw = i.fields.getTextInputValue('day-number');
		if (!dayNumberRaw) throw new InteractionError('No day number was provided');

		const dayNumber = Number(dayNumberRaw);
		if (isNaN(dayNumber)) throw new InteractionError('The provided day number is not a number');

		const vc = await getVoteCounter({ channelId: i.channel.id });
		if (!vc) throw new InteractionError('No vote counter was found');

		await prisma.vote.deleteMany({
			where: {
				voteCounterId: vc.id,
			},
		});

		await prisma.voteCounter.update({
			where: {
				id: vc.id,
			},
			data: {
				currentRound: dayNumber,
				currentIteration: 0,
			},
		});

		const newVC = await getVoteCounter({ channelId: i.channel.id });
		if (!newVC) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const stateMenuPayload = genStateEmbed(newVC);
		await i.reply({ ...stateMenuPayload, ephemeral: true });
	});
