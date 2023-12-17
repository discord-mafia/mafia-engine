import { ActionRowBuilder, TextInputBuilder, type CacheType, type ModalSubmitInteraction, type ModalActionRowComponentBuilder, TextInputStyle } from 'discord.js';
import { Modal } from '../../structures/interactions/Modal';
import { InteractionError } from '../../structures/interactions/_Interaction';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genStateEmbed } from '@views/votecounter';
import { prisma } from '@root/index';

export default new Modal('manage-vc-players-set-vote-weight')
	.set((modal) => {
		modal.setTitle('Set Vote Weight');
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>();
		row.addComponents(new TextInputBuilder().setCustomId('vote-weight').setLabel('Vote Weight').setStyle(TextInputStyle.Short).setRequired(true));
		modal.addComponents(row);
	})
	.onExecute(async (i: ModalSubmitInteraction<CacheType>, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('No cache was provided');

		const voteWeightRaw = i.fields.getTextInputValue('vote-weight');
		if (!voteWeightRaw) throw new InteractionError('No vote weight was provided');

		const voteWeight = Number(voteWeightRaw);
		if (isNaN(voteWeight)) throw new InteractionError('The provided vote weight is not a number');

		const vc = await getVoteCounter({ channelId: i.channel.id });
		if (!vc) throw new InteractionError('No vote counter was found');

		const player = await prisma.player.findFirst({
			where: {
				voteCounterId: vc.id,
				discordId: cache,
			},
		});
		if (!player) throw new InteractionError('No player was found');

		await prisma.player.update({
			where: {
				id: player.id,
			},
			data: {
				voteWeight,
			},
		});

		const newVC = await getVoteCounter({ channelId: i.channel.id });
		if (!newVC) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const stateMenuPayload = genStateEmbed(newVC);
		await i.reply({ ...stateMenuPayload, ephemeral: true });
	});
