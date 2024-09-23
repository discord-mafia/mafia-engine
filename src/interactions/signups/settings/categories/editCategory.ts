import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
} from 'discord.js';
import { TextSelectMenu } from '../../../../builders/textSelectMenu';
import { InteractionError } from '../../../../utils/errors';
import {
	getHydratedSignupFromChannel,
	HydratedCategory,
} from '../../../../db/signups';
import { cleanUsername } from '../../../../utils/usernames';
import { Button } from '../../../../builders/button';

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

		const { embed, row } = genEditCategoryMenu(category);
		await i.update({ embeds: [embed], components: [row] });
	});

export function genEditCategoryMenu(category: HydratedCategory) {
	const embed = new EmbedBuilder();
	embed.setTitle(`Edit Category - ${category.name}`);

	const users: string[] = [];
	for (const user of category.users) {
		users.push(cleanUsername(user.username));
	}

	let categoryTitle: string = '';
	if (category.limit)
		categoryTitle = `${category.name} [${users.length}/${category.limit}]`;
	else categoryTitle = `${category.name} [${users.length}]`;

	embed.addFields({
		name: categoryTitle,
		value: users.length > 0 ? `${users.join('\n')}` : '> None',
	});

	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(
		addUserButton.build(),
		removeUserButton.build(),
		cullUserButton.build(),
		renameCategoryButton.build(),
		limitChangeButton.build()
	);

	return { embed, row };
}

export const addUserButton = new Button('add-user-to-category')
	.setLabel('Add Users')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const removeUserButton = new Button('remove-user-from-category')
	.setLabel('Remove User')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const cullUserButton = new Button('cull-user-from-category')
	.setLabel('Cull Users')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const renameCategoryButton = new Button('rename-category')
	.setLabel('Rename Category')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});

export const limitChangeButton = new Button('change-category-limit')
	.setLabel('Change Category Limit')
	.setStyle(ButtonStyle.Secondary)
	.onExecute(async (i) => {
		await i.reply({
			content: 'This feature is not yet implemented',
			ephemeral: true,
		});
	});
