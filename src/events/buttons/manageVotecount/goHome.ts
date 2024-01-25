import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';
import { ButtonStyle } from 'discord.js';

export default new CustomButtonBuilder('manage-vc-home')
	.onGenerate((builder) => builder.setLabel('Home').setStyle(ButtonStyle.Primary))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genVoteCountEmbed(vc);
		i.update(payload);
	});
