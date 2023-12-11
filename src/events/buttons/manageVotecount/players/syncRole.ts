import { type ButtonBuilder, type ButtonInteraction, type CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '@models/votecounter';
import { genPlaceholderEmbed } from '@views/votecounter';

export default class SyncRolePlayersButton extends CustomButton {
	static customId = 'manage-vc-players-sync-role';
	constructor() {
		super(SyncRolePlayersButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		const payload = genPlaceholderEmbed(vc ?? undefined);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Sync Role');
	}
}
