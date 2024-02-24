import { getSignup } from '@models/signups';
import { CustomButtonBuilder } from '@structures/interactions/Button';
import { ActionRowBuilder, UserSelectMenuBuilder } from 'discord.js';
import removeUserSelect from '../../selectMenus/removeUserFromSignup';
export enum VCSettings {
	LOCK_VOTES = 'lock-votes',
	MAJORITY = 'majority',
	NO_LYNCH = 'nolynch',
}

export default new CustomButtonBuilder('remove-player-from-signup')
	.onGenerate((builder) => builder.setLabel('Remove Player/s'))
	.onExecute(async (i, cache) => {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'The button you pressed was invalid', ephemeral: true });
		const signup = await getSignup({ messageId: cache });
		if (!signup) return i.reply({ content: 'The button you pressed was for a signup that no longer exists', ephemeral: true });

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();
		row.addComponents(removeUserSelect.build(signup.messageId));

		return await i.update({ components: [row] });
	});
