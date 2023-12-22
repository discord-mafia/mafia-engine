import type { ButtonBuilder, ButtonInteraction, CacheType } from 'discord.js';
import { CustomButton } from '@structures/interactions/Button';
import { genSignupSettingsEmbed, genSignupRemovePlayersComponents } from '@views/signups';
import { getSignup } from '@models/signups';

export enum VCSettings {
	LOCK_VOTES = 'lock-votes',
	MAJORITY = 'majority',
	NO_LYNCH = 'nolynch',
}

export default class RemovePlayerFromSignupsButton extends CustomButton {
	static customId = 'remove-player-from-signup';
	constructor() {
		super(RemovePlayerFromSignupsButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>, cache: string) {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'The button you pressed was invalid', ephemeral: true });
		const signup = await getSignup({ messageId: cache });
		if (!signup) return i.reply({ content: 'The button you pressed was for a signup that no longer exists', ephemeral: true });

		const embed = genSignupSettingsEmbed(signup);
		const row = genSignupRemovePlayersComponents(signup);

		return await i.update({ embeds: [embed], components: [row] });
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Remove Player/s');
	}
}
