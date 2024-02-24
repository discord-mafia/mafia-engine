import { prisma } from '../../..';
import { getVoteCounter } from '../../../models/votecounter';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '../../../views/votecounter';

export default new CustomButtonBuilder('manage-vc-create')
	.onGenerate((builder) => builder.setLabel('Create VC'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		await prisma.voteCounter.create({ data: { channelId: i.channelId } });
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return await i.update(genCreateVoteCountEmbed());
		const payload = genVoteCountEmbed(vc);
		await i.update(payload);
	});
