import { ButtonStyle } from 'discord.js';
import { getVoteCounter } from '../../../models/votecounter';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '../../../views/votecounter';

export default new CustomButtonBuilder('manage-vc-home')
	.onGenerate((builder) => builder.setLabel('Home').setStyle(ButtonStyle.Primary))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genVoteCountEmbed(vc);
		i.update(payload);
	});
