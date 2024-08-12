import { type BaseMessageOptions, ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import toggleSettings, { VCSettings } from './toggles/toggleSettings';
import GoHomeButton from './goHome';
import { getVoteCounter, FullVoteCount } from '../../../models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '../../../views/votecounter';
import setTimedMajority from './state/setTimedMajority';

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
		toggleSettings
			.build(VCSettings.NO_LYNCH)
			.setLabel('Toggle No-Lynch')
			.setEmoji(vc.noLynch ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		toggleSettings
			.build(VCSettings.MAJORITY)
			.setLabel('Toggle Majority')
			.setEmoji(vc.majority ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		toggleSettings
			.build(VCSettings.LOCK_VOTES)
			.setLabel('Toggle Vote-Lock')
			.setEmoji(vc.lockVotes ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary)
	);

	row.addComponents(setTimedMajority.build());

	return {
		embeds,
		components: [row],
	};
}
