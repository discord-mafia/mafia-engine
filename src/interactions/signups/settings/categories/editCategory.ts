import { ChannelType, EmbedBuilder } from 'discord.js';
import { TextSelectMenu } from '../../../../builders/textSelectMenu';
import { InteractionError } from '../../../../utils/errors';
import {
	getHydratedSignupFromChannel,
	HydratedCategory,
} from '../../../../db/signups';

export const editCategoryMenu = new TextSelectMenu('edit-category')
	.setMinValues(1)
	.setMaxValues(1)
	.onExecute(async (i) => {
		if (!i.guild)
			throw new InteractionError(
				'Cannot use this command outside of a server'
			);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(
				'Cannot use this command outside of a text channel'
			);

		if (i.values.length < 1) throw new InteractionError('Invalid category');
		const rawRequestedCategoryId = i.values.shift();
		if (!rawRequestedCategoryId)
			throw new InteractionError('Invalid category');

		const categoryId = parseInt(rawRequestedCategoryId);
		if (isNaN(categoryId)) throw new InteractionError('Invalid category');

		const signup = await getHydratedSignupFromChannel(i.channelId);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		const category = signup.categories.find((c) => c.id == categoryId);
		if (!category) throw new InteractionError('Invalid category');

		const { embed } = genEditCategoryMenu(category);
		await i.update({ embeds: [embed] });
	});

export function genEditCategoryMenu(category: HydratedCategory) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Edit Category - ${category.name}`);

	return { embed };
}
