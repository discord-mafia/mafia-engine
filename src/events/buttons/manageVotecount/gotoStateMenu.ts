import { type ButtonInteraction, type CacheType, type ButtonBuilder, type BaseMessageOptions, ActionRowBuilder } from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { getVoteCounter, type FullVoteCount } from '../../../util/database';
import GoHomeButton, { generateBaseVcMenu, manageVoteCountEmbeds } from './goHome';
import JumpToDayButton from './state/jumpToDay';

export default class GotoStateButton extends CustomButton {
	static customId = 'manage-vc-state-menu';
	constructor() {
		super(GotoStateButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(manageVoteCountEmbeds.create());
		const payload = generateManageStateEmbed(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Manage State');
	}
}

export function generateManageStateEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return manageVoteCountEmbeds.create();
	const { embeds } = generateBaseVcMenu(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	const jumpToDay = CustomButton.getButtonOrThrow(JumpToDayButton.customId);

	row.addComponents(homeButton.generateButton(), jumpToDay.generateButton());

	return {
		embeds,
		components: [row],
	};
}
