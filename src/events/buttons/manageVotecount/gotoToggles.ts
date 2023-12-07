import { type ButtonInteraction, type CacheType, ButtonBuilder, type BaseMessageOptions, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import ToggleSettingsButton, { VCSettings } from './toggles/toggleSettings';
import GoHomeButton, { generateBaseVcMenu, generateCreateVCEmbed } from './goHome';
import { getVoteCounter, type FullVoteCount } from '@models/automaticGames';

export default class GotoTogglesMenu extends CustomButton {
	static customId = 'manage-vc-toggles-menu';
	constructor() {
		super(GotoTogglesMenu.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(generateCreateVCEmbed());
		const payload = genTogglesMenu(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Manage Toggles');
	}
}

export function genTogglesMenu(vc: FullVoteCount): BaseMessageOptions {
	const { embeds } = generateBaseVcMenu(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	const button = CustomButton.getButtonOrThrow(ToggleSettingsButton.customId);
	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);

	row.addComponents(
		homeButton.generateButton(),
		new ButtonBuilder()
			.setCustomId(button.createCustomID(VCSettings.NO_LYNCH))
			.setLabel(`Toggle No-Lynch`)
			.setEmoji(vc.noLynch ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(button.createCustomID(VCSettings.MAJORITY))
			.setLabel(`Toggle Majority`)
			.setEmoji(vc.majority ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(button.createCustomID(VCSettings.LOCK_VOTES))
			.setLabel(`Toggle Vote-Lock`)
			.setEmoji(vc.lockVotes ? '🔳' : '⬜')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		embeds,
		components: [row],
	};
}
