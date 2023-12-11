import type { ButtonBuilder, ButtonInteraction, CacheType } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { prisma } from '../../..';
import { InteractionError } from '../../../structures/interactions';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';

export default class CreateVotecountButton extends CustomButton {
	static customId = 'manage-vc-create';
	constructor() {
		super(CreateVotecountButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		await prisma.voteCounter.create({ data: { channelId: i.channelId } });
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return await i.update(genCreateVoteCountEmbed());
		const payload = genVoteCountEmbed(vc);
		await i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Create VC');
	}
}
