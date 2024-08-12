import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getSignup } from '../../../models/signups';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { signupSettingsMain } from '../../../views/signups';
import manageCategory from '../../selectMenus/signups/manageCategory';

export default new CustomButtonBuilder('signups-manage-categories')
	.onGenerate((builder) => builder.setLabel('Manage Categories'))
	.onExecute(async (i, cache) => {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'The button you pressed was invalid', ephemeral: true });
		const signup = await getSignup({ messageId: cache });
		if (!signup) return i.reply({ content: 'The button you pressed was for a signup that no longer exists', ephemeral: true });

		const payload = signupSettingsMain(signup);
		const row = new ActionRowBuilder<StringSelectMenuBuilder>();

		const select = manageCategory.build(signup.messageId);
		select.addOptions(
			signup.categories.map((v) => {
				return {
					label: v.name,
					value: v.id.toString(),
				};
			})
		);

		row.addComponents(select);
		payload.components = [row];

		return await i.update(payload);
	});
