import { type BaseMessageOptions, ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { VCSettings } from './toggles/toggleSettings';
import { getVoteCounter, type FullVoteCount } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';
import GoHomeButton from './goHome';

const toggleMenuBtn = new CustomButtonBuilder('manage-vc-toggles-menu')
	.onGenerate((builder) => builder.setLabel('Manage Toggles'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());
		const payload = genTogglesMenu(vc);
		return i.update(payload);
	});

export default toggleMenuBtn;

export function genTogglesMenu(vc: FullVoteCount): BaseMessageOptions {
	const { embeds } = genVoteCountEmbed(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		GoHomeButton.build(),
		toggleMenuBtn
			.build(VCSettings.NO_LYNCH)
			.setLabel('Toggle No-Lynch')
			.setEmoji(vc.noLynch ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		toggleMenuBtn
			.build(VCSettings.MAJORITY)
			.setLabel('Toggle Majority')
			.setEmoji(vc.majority ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		toggleMenuBtn
			.build(VCSettings.LOCK_VOTES)
			.setLabel('Toggle Vote-Lock')
			.setEmoji(vc.lockVotes ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		embeds,
		components: [row],
	};
}
